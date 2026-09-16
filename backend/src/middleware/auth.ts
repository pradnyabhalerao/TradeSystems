import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
export type AuthUser = { userId: number; role: Role };
const secret = () => process.env.JWT_SECRET ?? "development-secret";
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ success: false, message: "Authentication required" });
  try { res.locals.user = jwt.verify(token, secret()) as AuthUser; next(); } catch { res.status(401).json({ success: false, message: "Invalid or expired token" }); }
}
export const requireRole = (...roles: Role[]) => (_req: Request, res: Response, next: NextFunction) => {
  if (!roles.includes((res.locals.user as AuthUser).role)) return res.status(403).json({ success: false, message: "Insufficient permissions" });
  next();
};
