import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../../repositories/AuthRepository.ts";

@injectable()
export class LoginUserUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(email: string, password: string): Promise<string | null> {
        return await this.authRepository.authenticate(email, password);
    }
}
