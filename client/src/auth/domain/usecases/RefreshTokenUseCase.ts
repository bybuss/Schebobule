import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../repositories/AuthRepository";

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(refreshToken: string) {
        console.log("[RefreshTokenUseCase] Executing token refresh");
        if (!refreshToken) {
            throw new Error("Refresh token обязателен");
        }
        return this.authRepository.refreshToken(refreshToken);
    }
}
