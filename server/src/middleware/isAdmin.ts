import type { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user || !user.is_admin) {
    return res.status(403).json({ message: "You do not have the necessary permissions" });
  }

  console.log('User from token:', JSON.stringify(user));
  console.log('isAdmin value:', user?.isAdmin);

  next();
};
