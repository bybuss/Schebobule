import { inject, injectable, singleton } from "tsyringe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthRepository } from "../../domain/repositories/AuthRepository.ts";
import { UserDao } from "../../data/dao/UserDao.ts";
import { RefreshTokenDao } from "../../data/dao/RefreshTokenDao.ts";
import { AccessTokenBlacklistDao } from "../../data/dao/AccessTokenBlacklistDao.ts";
import type { JwtPayload } from "../../domain/models/JwtPayload.ts";

@singleton()
@injectable()
export class AuthRepositoryImpl implements AuthRepository {
    private readonly ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    private readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    private readonly ACCESS_TOKEN_EXPIRES_IN = "15m";
    private readonly REFRESH_TOKEN_EXPIRES_IN = "7d";

    constructor(
        @inject(UserDao) private userDao: UserDao,
        @inject(RefreshTokenDao) private refreshTokenDao: RefreshTokenDao,
        @inject(AccessTokenBlacklistDao) private blacklistDao: AccessTokenBlacklistDao
    ) {}

    async authenticate(email: string, password: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        const user = await this.userDao.findByEmail(email);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        return await this.generateTokens(user);
    }

    async register(email: string, password: string, isAdmin: boolean = false): Promise<{ accessToken: string; refreshToken: string } | null> {
        const existingUser = await this.userDao.findByEmail(email);
        if (existingUser) return null;

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await this.userDao.create(email, passwordHash, isAdmin);

        return await this.generateTokens(newUser);
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        try {
            const storedToken = await this.refreshTokenDao.findByToken(refreshToken);
            if (!storedToken) return null;

            if (!this.REFRESH_TOKEN_SECRET) {
                throw new Error("REFRESH_TOKEN_SECRET is not defined");
            }

            const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);
            
            const payload = decoded as any;
            if (!payload || typeof payload !== "object" || !payload.email) {
                throw new Error("Invalid token payload");
            }

            if (payload.type !== "refresh") {
                throw new Error("Invalid token type");
            }

            const user = await this.userDao.findByEmail(payload.email);
            if (!user) return null;

            await this.refreshTokenDao.revokeToken(refreshToken);

            return await this.generateTokens(user);
        } catch (error) {
            console.error("Token refresh error:", error);
            return null;
        }
    }

    async logout(accessToken: string, refreshToken: string): Promise<boolean> {
        try {
            const refreshRevoked = await this.refreshTokenDao.revokeToken(refreshToken);
            
            if (accessToken) {
                const decoded = jwt.decode(accessToken) as JwtPayload;
                if (decoded && decoded.exp) {
                    const expiresAt = new Date(decoded.exp * 1000);
                    await this.blacklistDao.addToBlacklist(accessToken, expiresAt);
                }
            }

            return refreshRevoked;
        } catch (error) {
            console.error("Logout error:", error);
            return false;
        }
    }

    async isAccessTokenBlacklisted(token: string): Promise<boolean> {
        return await this.blacklistDao.isTokenBlacklisted(token);
    }

    private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        if (!this.ACCESS_TOKEN_SECRET || !this.REFRESH_TOKEN_SECRET) {
            throw new Error("JWT secrets are not defined");
        }

        const accessTokenPayload: JwtPayload = {
            userId: user.id,
            email: user.email,
            is_admin: user.is_admin,
            type: "access"
        };

        const refreshTokenPayload: JwtPayload = {
            userId: user.id,
            email: user.email,
            is_admin: user.is_admin,
            type: "refresh"
        };

        const accessToken = jwt.sign(accessTokenPayload, this.ACCESS_TOKEN_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        });

        const refreshToken = jwt.sign(refreshTokenPayload, this.REFRESH_TOKEN_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.refreshTokenDao.create({
            userId: user.id,
            token: refreshToken,
            expiresAt,
            isRevoked: false
        });

        return { accessToken, refreshToken };
    }
}
