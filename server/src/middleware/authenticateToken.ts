import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "../domain/models/JwtPayload";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    
    if (!token) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }

    try {
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) {
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, accessTokenSecret) as JwtPayload;
        
        if (decoded.type !== "access") {
            return res.status(403).json({ message: "Invalid token type" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
