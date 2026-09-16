import { Request, Response } from "express";
import { prisma } from "../db";
import { enquirySchema } from "../utils/validation";
import { AuthUser } from "../middleware/auth";
import { idParam } from "../utils/http";
const number = () => `ENQ-${Date.now().toString().slice(-8)}`;
export async function listEnquiries(_req: Request, res: Response) { res.json({ success: true, data: await prisma.enquiry.findMany({ include: { customer: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }) }); }
export async function createEnquiry(req: Request, res: Response) { const input = enquirySchema.parse(req.body); const data = await prisma.enquiry.create({ data: { enquiryNo: number(), customerId: input.customerId, createdById: (res.locals.user as AuthUser).userId, requiredDate: input.requiredDate ? new Date(input.requiredDate) : undefined, notes: input.notes, items: { create: input.items } }, include: { customer: true, items: { include: { product: true } } } }); res.status(201).json({ success: true, data }); }
export async function getEnquiry(req: Request, res: Response) { const data = await prisma.enquiry.findUnique({ where: { id: idParam(req.params.id) }, include: { customer: true, items: { include: { product: true } }, quotations: true } }); if (!data) return res.status(404).json({ success: false, message: "Enquiry not found" }); res.json({ success: true, data }); }
export async function updateEnquiry(req: Request, res: Response) { const data = await prisma.enquiry.update({ where: { id: idParam(req.params.id) }, data: { status: req.body.status } }); res.json({ success: true, data }); }
