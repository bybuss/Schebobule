import type { User } from "../../domain/models/User.ts";

export interface AuthRepository {
    authenticate(email: string, password: string): Promise<string | null>;
    register(email: string, password: string): Promise<string | null>;
}
