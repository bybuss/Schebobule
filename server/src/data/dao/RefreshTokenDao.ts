import { singleton } from "tsyringe";
import type { RefreshToken } from "../../domain/models/RefreshToken.ts";
import { Pool } from "pg";

@singleton()
export class RefreshTokenDao {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(token: Omit<RefreshToken, "id" | "createdAt" | "updatedAt">): Promise<RefreshToken> {
        const result = await this.pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [token.userId, token.token, token.expiresAt, token.isRevoked]
        );
        return this.mapToRefreshToken(result.rows[0]);  
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        const result = await this.pool.query(
            "SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()",
            [token]
        );
        return result.rows.length > 0 ? this.mapToRefreshToken(result.rows[0]) : null;
    }

    async revokeToken(token: string): Promise<boolean> {
        const result = await this.pool.query(
            "UPDATE refresh_tokens SET is_revoked = true WHERE token = $1",
            [token]
        );
        return (result.rowCount || 0) > 0;
    }

    async revokeAllUserTokens(userId: number): Promise<boolean> {
        const result = await this.pool.query(
            "UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1",
            [userId]
        );
        return (result.rowCount || 0) > 0;
    }

    async deleteExpiredTokens(): Promise<boolean> {
        const result = await this.pool.query(
            "DELETE FROM refresh_tokens WHERE expires_at < NOW()"
        );
        return (result.rowCount || 0) > 0;
    }

    private mapToRefreshToken(row: any): RefreshToken {
        return {
            id: row.id,
            userId: row.user_id,
            token: row.token,
            expiresAt: new Date(row.expires_at),
            isRevoked: row.is_revoked,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
