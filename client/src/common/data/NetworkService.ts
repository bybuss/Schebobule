import { injectable, inject } from "tsyringe";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { TokenService } from "./TokenService";

@injectable()
export class NetworkService {
    private client: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor(
        @inject(TokenService) private tokenService: TokenService
    ) {
        this.client = axios.create({
            baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
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
                console.log("[NetworkService] Response error:", error.response?.status, error.config.url);

                if (error.response?.status === 401 && !originalRequest._retry) {
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
                            throw new Error("No refresh token");
                        }
                    } catch (refreshError) {
                        console.error("[NetworkService] Token refresh failed:", refreshError);
                        this.tokenService.clearTokens();
                        window.location.href = "/login";
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }
                return Promise.reject(error);
            }
        );
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
