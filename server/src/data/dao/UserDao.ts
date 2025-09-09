import { singleton } from "tsyringe";
import type { User } from "../../domain/models/User.ts";
import { Pool } from "pg";

@singleton()
export class UserDao {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async create(email: string, passwordHash: string): Promise<User> {
        const result = await this.pool.query(
            'INSERT INTO users (email, passwordHash) VALUES ($1, $2) RETURNING *',
            [email, passwordHash]
        );
        return result.rows[0];
    }
}
