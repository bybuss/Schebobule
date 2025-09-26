import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../../repositories/AuthRepository.ts";

@injectable()
export class LogoutUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(refreshToken: string): Promise<boolean> {
        return await this.authRepository.logout(refreshToken);
    }
}
