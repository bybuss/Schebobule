import { AuthRepository } from "../repositories/AuthRepository";

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string, isAdmin: boolean) {
    if (!email || !password) {
      throw new Error('Email и пароль обязательны');
    }
    return this.authRepository.register(email, password, isAdmin);
  }
}