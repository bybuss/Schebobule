import { injectable, inject } from "tsyringe";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { TokenService } from "./TokenService";

@injectable()
export class NetworkService {
    private client: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor(@inject(TokenService) private tokenService: TokenService) {
        console.log("[NetworkService] Initializing with base URL:", process.env.REACT_APP_BASE_API_URL  || "http://localhost:5000");
        
        this.client = axios.create({
            baseURL: process.env.REACT_APP_BASE_API_URL || "http://localhost:5000",
            timeout: 10000,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.client.interceptors.request.use(
            (config) => {
                const token = this.tokenService.getAccessToken();
                if (token) {
                    console.log("[NetworkService] Adding Authorization header to request:", config.url);
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                console.error("[NetworkService] Request interceptor error:", error);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                console.log("[NetworkService] Response received:", response.status, response.config.url);
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                
                console.error("[NetworkService] Response error:", {
                    status: error.response?.status,
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.response?.data,
                    message: error.message
                });

                let userFriendlyMessage = "Произошла неизвестная ошибка";

                if (error.message === "Network Error") {
                    userFriendlyMessage = "Отсутствует интернет соединение. Проверьте подключение к сети.";
                }
                else if (error.code === "ECONNABORTED") {
                    userFriendlyMessage = "Сервер не отвечает. Попробуйте позже.";
                }
                else if (error.response?.status) {
                    switch (error.response.status) {
                        case 400:
                            if (error.response.data?.message) {
                                userFriendlyMessage = error.response.data.message;
                            } else if (error.response.data?.error) {
                                userFriendlyMessage = error.response.data.error;
                            } else {
                                userFriendlyMessage = "Некорректный запрос. Проверьте введенные данные.";
                            }
                            break;
                        case 401:
                            userFriendlyMessage = "Неверный email или пароль";
                            break;
                        case 403:
                            userFriendlyMessage = "У вас нет прав для выполнения этого действия";
                            break;
                        case 404:
                            userFriendlyMessage = "Страница или ресурс не найдены";
                            break;
                        case 409:
                            userFriendlyMessage = "Пользователь с таким email уже существует";
                            break;
                        case 422:
                            userFriendlyMessage = "Некорректные данные. Проверьте все поля формы.";
                            break;
                        case 429:
                            userFriendlyMessage = "Слишком много запросов. Попробуйте позже.";
                            break;
                        case 500:
                        case 502:
                        case 503:
                        case 504:
                            userFriendlyMessage = "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.";
                            break;
                        default:
                            userFriendlyMessage = `Ошибка ${error.response.status}. Попробуйте еще раз.`;
                    }
                }

                if (error.response?.data) {
                    const backendMessage = this.extractBackendMessage(error.response.data);
                    if (backendMessage) {
                        userFriendlyMessage = backendMessage;
                    }
                }

                const friendlyError = new Error(userFriendlyMessage);
                friendlyError.name = error.name;
                
                if (error.response?.status === 401  || error.response?.status === 403 && !originalRequest._retry) {
                    console.log("[NetworkService] 401 error detected, attempting token refresh");
                    
                    if (this.isRefreshing) {
                        console.log("[NetworkService] Token refresh already in progress, queuing request");
                        return new Promise((resolve) => {
                            this.refreshSubscribers.push((token: string) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                resolve(this.client(originalRequest));
                            });
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshToken = this.tokenService.getRefreshToken();
                        if (refreshToken) {
                            console.log("[NetworkService] Refreshing token...");
                            
                            const response = await axios.post(
                                `${this.client.defaults.baseURL}/refresh-token`,
                                { refreshToken }
                            );
                            
                            const { accessToken, refreshToken: newRefreshToken } = response.data;
                            this.tokenService.setTokens(accessToken, newRefreshToken);
                            
                            console.log("[NetworkService] Token refresh successful, retrying original request");
                            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                            
                            this.refreshSubscribers.forEach((callback) => callback(accessToken));
                            this.refreshSubscribers = [];
                            
                            return this.client(originalRequest);
                        } else {
                            console.error("[NetworkService] No refresh token available");
                            throw new Error("Сессия истекла. Войдите снова.");
                        }
                    } catch (refreshError) {
                        console.error("[NetworkService] Token refresh failed:", refreshError);
                        this.tokenService.clearTokens();
                        window.location.href = "/login";
                        throw new Error("Сессия истекла. Войдите снова.");
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                throw friendlyError;
            }
        );
    }

    private extractBackendMessage(data: any): string | null {
        try {
            if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    return this.extractBackendMessage(parsed);
                } catch {
                    return data;
                }
            } else if (typeof data === 'object' && data !== null) {
                if (data.message) return data.message;
                if (data.error) return data.error;
                if (data.detail) return data.detail;
                if (data.errors) {
                    if (Array.isArray(data.errors)) {
                        return data.errors.map((err: any) => 
                            err.message || err.error || JSON.stringify(err)
                        ).join(', ');
                    }
                    return JSON.stringify(data.errors);
                }
                return JSON.stringify(data);
            }
            return null;
        } catch (error) {
            console.error("[NetworkService] Error extracting backend message:", error);
            return null;
        }
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        console.log("[NetworkService] GET request:", url);
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        console.log("[NetworkService] POST request:", url, data);
        const response: AxiosResponse<T> = await this.client.post(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        console.log("[NetworkService] PUT request:", url, data);
        const response: AxiosResponse<T> = await this.client.put(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        console.log("[NetworkService] DELETE request:", url);
        const response: AxiosResponse<T> = await this.client.delete(url, config);
        return response.data;
    }
}
