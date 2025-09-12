import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../../domain/repositories/AuthRepository.ts";

@injectable()
export class RegisterUserUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(email: string, password: string): Promise<string | null> {
        return await this.authRepository.register(email, password);
    }
}
