import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "../domain/models/JwtPayload.ts";
import { container } from "tsyringe";
import { AuthRepositoryImpl } from "../data/repositories/AuthRepositoryImpl.ts";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    
    console.log("[authenticateToken] Checking token:", token);
    
    if (!token) {
        console.log("[authenticateToken] No token provided");
        return res.status(401).json({ message: "Authorization token is missing" });
    }

    try {
        const authRepository = container.resolve(AuthRepositoryImpl);
        const isBlacklisted = await authRepository.isAccessTokenBlacklisted(token);
        console.log("[authenticateToken] Is token in blacklist:", isBlacklisted);
        
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token has been revoked" });
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) {
            console.log("[authenticateToken] ACCESS_TOKEN_SECRET is not defined");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, accessTokenSecret) as JwtPayload;
        console.log("[authenticateToken] Token decoded successfully:", { 
            userId: decoded.userId, 
            email: decoded.email,
            type: decoded.type 
        });

        if (decoded.type !== "access") {
            console.log("[authenticateToken] Invalid token type:", decoded.type);
            return res.status(403).json({ message: "Invalid token type" });
        }

        req.user = decoded;
        console.log("[authenticateToken] Authentication successful");
        next();
    } catch (err) {
        console.log("[authenticateToken] Token verification failed:", err);
        
        const authRepository = container.resolve(AuthRepositoryImpl);
        const isBlacklisted = await authRepository.isAccessTokenBlacklisted(token);
        
        if (isBlacklisted) {
            console.log("[authenticateToken] Token is both blacklisted and expired");
            return res.status(401).json({ message: "Token has been revoked" });
        }
        
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
