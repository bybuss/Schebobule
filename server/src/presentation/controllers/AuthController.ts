import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { LoginUserUseCase } from "src/domain/usecases/auth/LoginUserUseCase";
import { RegisterUserUseCase } from "src/domain/usecases/auth/RegisterUserUseCase";

@injectable()
class AuthController {
    constructor(
        @inject(LoginUserUseCase) private loginUseCase: LoginUserUseCase,
        @inject(RegisterUserUseCase) private registerUserUseCase: RegisterUserUseCase
    ) {}

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;

        console.log(`Login attempt with email: ${email}, password: ${password}`);

        const token = await this.loginUseCase.execute(email, password);

        if (!token) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        res.json({ token });
    }

    async register(req: Request, res: Response): Promise<void> {
        const { email, password, is_admin } = req.body;

        console.log(`Register attempt with email: ${email}, password: ${password}, is_admin: ${is_admin}`);

        const token = await this.registerUserUseCase.execute(email, password, is_admin);
        
        if (!token) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        res.json({ token });
    }
}

export default AuthController;
