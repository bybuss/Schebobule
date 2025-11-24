import { singleton } from "tsyringe";
import { Pool } from "pg";

@singleton()
export class AccessTokenBlacklistDao {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async addToBlacklist(token: string, expiresAt: Date): Promise<boolean> {
        try {
            console.log("[AccessTokenBlacklistDao] Adding token to blacklist");
            
            const result = await this.pool.query(
                `INSERT INTO access_token_blacklist (token, expires_at) 
                VALUES ($1, $2) 
                ON CONFLICT (token) 
                DO UPDATE SET expires_at = $2`,
                [token, expiresAt]
            );
            
            console.log(`[AccessTokenBlacklistDao] Insert result: ${result.rowCount} rows`);
            return true;
            
        } catch (error) {
            console.error("[AccessTokenBlacklistDao] Error:", error);
            return false;
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        console.log("[AccessTokenBlacklistDao] Checking blacklist for token");
        
        try {
            const result = await this.pool.query(
                "SELECT 1 FROM access_token_blacklist WHERE token = $1",
                [token]
            );
            
            console.log("[AccessTokenBlacklistDao] Blacklist check found rows:", result.rows.length);
            
            return result.rows.length > 0;
        } catch (error) {
            console.error("[AccessTokenBlacklistDao] Error checking blacklist:", error);
            return false;
        }
    }

    async cleanupExpiredTokens(): Promise<boolean> {
        const result = await this.pool.query(
            "DELETE FROM access_token_blacklist WHERE expires_at < NOW()"
        );
        return (result.rowCount || 0) > 0;
    }
}
