import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { LoginUserUseCase } from "src/domain/usecases/auth/LoginUserUseCase";
import { RegisterUserUseCase } from "src/domain/usecases/auth/RegisterUserUseCase";
import { RefreshTokenUseCase } from "../../domain/usecases/auth/RefreshTokenUseCase.ts";
import { LogoutUseCase } from "../../domain/usecases/auth/LogoutUseCase.ts";

@injectable()
export class AuthController {
    constructor(
        @inject(LoginUserUseCase) private loginUseCase: LoginUserUseCase,
        @inject(RegisterUserUseCase) private registerUserUseCase: RegisterUserUseCase,
        @inject(RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase,
        @inject(LogoutUseCase) private logoutUseCase: LogoutUseCase
    ) {}

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;

        console.log(`Login attempt with email: ${email}`);

        const tokens = await this.loginUseCase.execute(email, password);

        if (!tokens) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }

    async register(req: Request, res: Response): Promise<void> {
        const { email, password, is_admin } = req.body;

        const tokens = await this.registerUserUseCase.execute(email, password, is_admin);
        
        if (!tokens) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ message: "Refresh token is required" });
            return;
        }

        const tokens = await this.refreshTokenUseCase.execute(refreshToken);

        if (!tokens) {
            res.status(401).json({ message: "Invalid or expired refresh token" });
            return;
        }

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            const authHeader = req.header("Authorization");
            const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            const { refreshToken } = req.body;

            if (!accessToken || !refreshToken) {
                res.status(400).json({ message: "Access token and refresh token are required" });
                return;
            }

            const success = await this.logoutUseCase.execute(accessToken, refreshToken);

            if (!success) {
                res.status(400).json({ message: "Failed to logout" });
                return;
            }

            res.json({ message: "Logged out successfully" });
        } catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
