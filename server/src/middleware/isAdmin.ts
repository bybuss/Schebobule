import type { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;

  console.log("User from token in isAdmin:", JSON.stringify(user));
  console.log("isAdmin value:", user?.isAdmin);

  const isUserAdmin = user?.isAdmin || user?.is_admin;
  
  if (!user || !user.isAdmin) {
    console.log("User is not an admin! 403 Error");
    return res.status(403).json({ message: "You do not have the necessary permissions" });
  }

  next();
};
