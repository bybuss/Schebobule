import { JwtPayload } from "../../auth/domain/models/JwtPayload";
import { User } from "../../auth/domain/models/User";

export class JwtService {
    decodeToken(token: string): JwtPayload | null {
        try {
            console.log("[JwtService] Decoding token");
            const base64Url = token.split('.')[1];
            if (!base64Url) {
                console.error("[JwtService] Invalid token format");
                return null;
            }
            
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload) as JwtPayload;
            console.log("[JwtService] Decoded payload:", payload);
            return payload;
        } catch (error) {
            console.error("[JwtService] Error decoding token:", error);
            return null;
        }
    }

    createUserFromToken(token: string): User | null {
        try {
            const payload = this.decodeToken(token);
            if (!payload) {
                return null;
            }

            const user: User = {
                id: payload.userId,
                email: payload.email,
                is_admin: payload.is_admin
            };

            console.log("[JwtService] Created user from token:", user);
            return user;
        } catch (error) {
            console.error("[JwtService] Error creating user from token:", error);
            return null;
        }
    }
}
