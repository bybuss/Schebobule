import { injectable, inject } from "tsyringe";
import { AuthRepository } from "../domain/repositories/AuthRepository";
import { User } from "../domain/models/User";
import { LoginRequest, LoginResponse, RegisterRequest } from "../data/models";
import { NetworkService } from "../../common/data/NetworkService";
import { JwtService } from "../../common/data/JwtService";

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
    constructor(
        @inject(NetworkService) private networkService: NetworkService,
        @inject(JwtService) private jwtService: JwtService
    ) {
        console.log("[AuthRepositoryImpl] Initialized");
    }

    async authenticate(email: string, password: string): Promise<{ 
        accessToken: string;
        refreshToken: string; 
        user: User 
    }> {
        console.log("[AuthRepositoryImpl] Authenticating user:", email);
        const loginRequest: LoginRequest = { email, password };
        
        const response = await this.networkService.post<LoginResponse>("/auth/login", loginRequest);
        
        console.log("[AuthRepositoryImpl] Authentication response:", response);
        
        const user = this.jwtService.createUserFromToken(response.accessToken);
        if (!user) {
            throw new Error("Failed to decode user from token");
        }

        console.log("[AuthRepositoryImpl] User created from token:", user);
        
        return {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: user
        };
    }

    async register(email: string, password: string, isAdmin: boolean): Promise<{ 
        accessToken: string; 
        refreshToken: string; 
        user: User 
    }> {
        console.log("[AuthRepositoryImpl] Registering user:", email, "isAdmin:", isAdmin);
        const registerRequest: RegisterRequest = { email, password, is_admin: isAdmin };
        
        const response = await this.networkService.post<LoginResponse>("/auth/register", registerRequest);
        
        console.log("[AuthRepositoryImpl] Registration response:", response);
        
        const user = this.jwtService.createUserFromToken(response.accessToken);
        if (!user) {
            throw new Error("Failed to decode user from token");
        }

        console.log("[AuthRepositoryImpl] User created from token:", user);
        
        return {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: user
        };
    }

    async refreshToken(refreshToken: string): Promise<{ 
        accessToken: string; 
        refreshToken: string 
    }> {
        console.log("[AuthRepositoryImpl] Refreshing token");
        return await this.networkService.post<{ 
            accessToken: string; 
            refreshToken: string 
        }>("/auth/refresh-token", { refreshToken });
    }

    async logout(accessToken: string, refreshToken: string): Promise<void> {
        console.log("[AuthRepositoryImpl] Logging out user");
        await this.networkService.post("/auth/logout", { accessToken, refreshToken });
    }
}
