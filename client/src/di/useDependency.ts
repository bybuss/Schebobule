import { container } from "./container";

export function useDependency<T>(token: any): T {
    try {
        console.log(`[useDependency] Resolving: ${token.name || token.toString()}`);
        const instance = container.resolve(token) as T;
        return instance;
    } catch (error) {
        console.error(`[useDependency] Failed to resolve ${token.name || token.toString()}:`, error);
        throw error;
    }
}
