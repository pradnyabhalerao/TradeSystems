import { Request, Response } from "express";
import { prisma } from "../db";
import { customerSchema } from "../utils/validation";
import { idParam } from "../utils/http";
export async function listCustomers(_req: Request, res: Response) { res.json({ success: true, data: await prisma.customer.findMany({ orderBy: { createdAt: "desc" } }) }); }
export async function createCustomer(req: Request, res: Response) { const data = customerSchema.parse(req.body); res.status(201).json({ success: true, data: await prisma.customer.create({ data }) }); }
export async function getCustomer(req: Request, res: Response) { const data = await prisma.customer.findUnique({ where: { id: idParam(req.params.id) }, include: { enquiries: true } }); if (!data) return res.status(404).json({ success: false, message: "Customer not found" }); res.json({ success: true, data }); }
export async function updateCustomer(req: Request, res: Response) { const data = customerSchema.parse(req.body); res.json({ success: true, data: await prisma.customer.update({ where: { id: idParam(req.params.id) }, data }) }); }
export async function deleteCustomer(req: Request, res: Response) { await prisma.customer.delete({ where: { id: idParam(req.params.id) } }); res.status(204).send(); }
