import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "../auth/domain/models/User";
import { TokenService } from "../common/data/TokenService";
import { container } from "../di/container";
import { JwtService } from "../common/data/JwtService";

interface AuthContextType {
    user: User | null;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const tokenService = container.resolve(TokenService);
    const jwtService = container.resolve(JwtService);

    useEffect(() => {
        console.log("[AuthProvider] Initializing auth context");
        const token = tokenService.getAccessToken();
        if (token) {
            console.log("[AuthProvider] Found access token, decoding user");
            const decodedUser = jwtService.createUserFromToken(token);
            if (decodedUser) {
                console.log("[AuthProvider] User decoded from token:", decodedUser);
                setUser(decodedUser);
            } else {
                console.log("[AuthProvider] Failed to decode user from token, clearing tokens");
                tokenService.clearTokens();
            }
        } else {
            console.log("[AuthProvider] No access token found");
        }
    }, [tokenService, jwtService]);

    const login = (user: User, accessToken: string, refreshToken: string) => {
        console.log("[AuthProvider] User logged in:", user.email);
        setUser(user);
        tokenService.setTokens(accessToken, refreshToken);
    };

    const logout = () => {
        console.log("[AuthProvider] User logged out");
        setUser(null);
        tokenService.clearTokens();
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
