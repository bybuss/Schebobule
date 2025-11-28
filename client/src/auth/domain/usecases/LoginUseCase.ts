import { injectable, inject } from "tsyringe";
import type { AuthRepository } from "../repositories/AuthRepository";

@injectable()
export class LoginUseCase {
    constructor(
        @inject("AuthRepository") private authRepository: AuthRepository
    ) {}

    async execute(email: string, password: string) {
        if (!email || !password) {
            throw new Error("Email и пароль обязательны");
        }
        return this.authRepository.authenticate(email, password);
    }
}
