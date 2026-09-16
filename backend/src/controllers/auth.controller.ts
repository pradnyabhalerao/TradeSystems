import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../db";
import { loginSchema, registerSchema } from "../utils/validation";
const token = (userId: number, role: Role) => jwt.sign({ userId, role }, process.env.JWT_SECRET ?? "development-secret", { expiresIn: "1d" });
export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return res.status(409).json({ success: false, message: "Email is already registered" });
  const user = await prisma.user.create({ data: { ...data, role: data.role as Role ?? Role.SALES_USER, passwordHash: await bcrypt.hash(data.password, 12) }, select: { id: true, name: true, email: true, role: true } });
  res.status(201).json({ success: true, user });
}
export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body); const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ success: false, message: "Invalid email or password" });
  res.json({ success: true, token: token(user.id, user.role), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
