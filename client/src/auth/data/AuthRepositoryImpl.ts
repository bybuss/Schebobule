import { injectable, inject } from "tsyringe";
import { AuthRepository } from "../domain/repositories/AuthRepository";
import { User } from "../domain/models/User";
import { LoginRequest, LoginResponse, RegisterRequest } from "../data/models";
import { NetworkService } from "../../common/data/NetworkService";

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
    constructor(
        @inject(NetworkService) private networkService: NetworkService
    ) {}

    async authenticate(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
        console.log("[AuthRepositoryImpl] Authenticating user:", email);
        const loginRequest: LoginRequest = { email, password };
        return await this.networkService.post<LoginResponse>("/login", loginRequest);
    }

    async register(email: string, password: string, isAdmin: boolean): Promise<{ accessToken: string; refreshToken: string; user: User }> {
        console.log("[AuthRepositoryImpl] Registering user:", email, "isAdmin:", isAdmin);
        const registerRequest: RegisterRequest = { email, password, is_admin: isAdmin };
        return await this.networkService.post<LoginResponse>("/register", registerRequest);
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        console.log("[AuthRepositoryImpl] Refreshing token");
        return await this.networkService.post<{ accessToken: string; refreshToken: string }>("/refresh-token", { refreshToken });
    }

    async logout(accessToken: string, refreshToken: string): Promise<void> {
        console.log("[AuthRepositoryImpl] Logging out user");
        await this.networkService.post("/logout", { accessToken, refreshToken });
    }
}