export interface AuthRepository {
    authenticate(email: string, password: string): Promise<{ accessToken: string; refreshToken: string } | null>;
    register(email: string, password: string, isAdmin?: boolean): Promise<{ accessToken: string; refreshToken: string } | null>;
    refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null>;
    logout(accessToken: string, refreshToken: string): Promise<boolean>;
    isAccessTokenBlacklisted(token: string): Promise<boolean>;
}
