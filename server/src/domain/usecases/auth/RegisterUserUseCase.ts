import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../../repositories/AuthRepository.ts";

@injectable()
export class RegisterUserUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(email: string, password: string, isAdmin: boolean = false): Promise<{ accessToken: string; refreshToken: string } | null> {
        return await this.authRepository.register(email, password, isAdmin);
    }
}
