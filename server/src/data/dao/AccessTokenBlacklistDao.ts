import { singleton } from "tsyringe";
import { Pool } from "pg";

@singleton()
export class AccessTokenBlacklistDao {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async addToBlacklist(token: string, expiresAt: Date): Promise<boolean> {
        const result = await this.pool.query(
            "INSERT INTO access_token_blacklist (token, expires_at) VALUES ($1, $2)",
            [token, expiresAt]
        );
        return (result.rowCount || 0) > 0;
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await this.pool.query(
            "SELECT 1 FROM access_token_blacklist WHERE token = $1 AND expires_at > NOW()",
            [token]
        );
        return result.rows.length > 0;
    }

    async cleanupExpiredTokens(): Promise<boolean> {
        const result = await this.pool.query(
            "DELETE FROM access_token_blacklist WHERE expires_at < NOW()"
        );
        return (result.rowCount || 0) > 0;
    }
}
