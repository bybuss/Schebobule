import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../../repositories/AuthRepository.ts";

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        return await this.authRepository.refreshToken(refreshToken);
    }
}
