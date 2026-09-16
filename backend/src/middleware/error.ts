import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/http";
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) return res.status(400).json({ success: false, message: "Invalid request", errors: error.flatten() });
  if (error instanceof HttpError) return res.status(error.statusCode).json({ success: false, message: error.message });
  if (error instanceof Prisma.PrismaClientInitializationError) return res.status(503).json({ success: false, message: "Database unavailable. Start PostgreSQL on localhost:5432 and run the Prisma migration." });
  console.error(error);
  return res.status(500).json({ success: false, message: "Internal server error" });
}
