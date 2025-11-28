import { User } from "../models/User";

export interface AuthRepository {
    authenticate(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }>;
    register(email: string, password: string, isAdmin: boolean): Promise<{ accessToken: string; refreshToken: string; user: User }>;
    refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
    logout(accessToken: string, refreshToken: string): Promise<void>;
}
