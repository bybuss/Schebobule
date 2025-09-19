import type { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user.isAdmin) {
    return res.status(403).json({ message: "You do not have the necessary permissions" });
  }

  next();
};
