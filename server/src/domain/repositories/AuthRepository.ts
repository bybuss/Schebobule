export interface AuthRepository {
    authenticate(email: string, password: string): Promise<string | null>;
    register(email: string, password: string, isAdmin: boolean): Promise<string | null>;
}
