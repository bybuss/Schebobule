import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../repositories/AuthRepository";

@injectable()
export class LogoutUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(accessToken: string, refreshToken: string) {
        console.log("[LogoutUseCase] Executing logout");
        return this.authRepository.logout(accessToken, refreshToken);
    }
}
