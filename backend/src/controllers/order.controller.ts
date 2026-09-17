import { Request, Response } from "express";
import { prisma } from "../db";
import { dispatchSchema } from "../utils/validation";
import { idParam, HttpError } from "../utils/http";
import { SalesOrderStatus, QuotationStatus } from "@prisma/client";
const number = (prefix: string) => `${prefix}-${Date.now().toString().slice(-8)}`;
const includeOrder = { customer: true, quotation: { include: { enquiry: true } }, items: { include: { product: { include: { inventory: true } } } }, dispatch: { include: { items: true } } } as const;
export async function listOrders(_req: Request, res: Response) { res.json({ success: true, data: await prisma.salesOrder.findMany({ include: includeOrder, orderBy: { createdAt: "desc" } }) }); }
export async function createOrder(req: Request, res: Response) { const quotationId = idParam(req.params.quotationId); const quotation = await prisma.quotation.findUnique({ where: { id: quotationId }, include: { items: true } }); if (!quotation || quotation.status !== QuotationStatus.ACCEPTED) throw new HttpError(400, "Only an accepted quotation can create an order"); try { const data = await prisma.$transaction(async tx => { const order = await tx.salesOrder.create({ data: { orderNo: number("ORD"), quotationId, customerId: quotation.customerId, total: quotation.total, items: { create: quotation.items.map(item => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice })) } }, include: includeOrder }); await tx.enquiry.update({ where: { id: quotation.enquiryId }, data: { status: "WON" } }); return order; }); res.status(201).json({ success: true, data }); } catch (error: any) { if (error.code === "P2002") throw new HttpError(409, "This quotation already has a sales order"); throw error; } }
export async function confirmOrder(req: Request, res: Response) { const orderId = idParam(req.params.id); const data = await prisma.$transaction(async tx => { const order = await tx.salesOrder.findUnique({ where: { id: orderId }, include: { items: true } }); if (!order || order.status !== SalesOrderStatus.PENDING) throw new HttpError(400, "Only pending orders can be confirmed"); for (const item of order.items) { const changed = await tx.$executeRaw`UPDATE "Inventory" SET "reservedQty" = "reservedQty" + ${item.quantity}, "updatedAt" = NOW() WHERE "productId" = ${item.productId} AND "physicalQty" - "reservedQty" - "damagedQty" >= ${item.quantity}`; if (changed !== 1) throw new HttpError(409, "Insufficient available inventory"); } return tx.salesOrder.update({ where: { id: orderId }, data: { status: SalesOrderStatus.CONFIRMED }, include: includeOrder }); }); res.json({ success: true, data }); }
export async function cancelOrder(req: Request, res: Response) { const id = idParam(req.params.id); const data = await prisma.$transaction(async tx => { const order = await tx.salesOrder.findUnique({ where: { id }, include: { items: true } }); const cancellable: SalesOrderStatus[] = [SalesOrderStatus.PENDING, SalesOrderStatus.CONFIRMED]; if (!order || !cancellable.includes(order.status)) throw new HttpError(400, "This order cannot be cancelled"); if (order.status === SalesOrderStatus.CONFIRMED) for (const item of order.items) await tx.inventory.update({ where: { productId: item.productId }, data: { reservedQty: { decrement: item.quantity } } }); return tx.salesOrder.update({ where: { id }, data: { status: SalesOrderStatus.CANCELLED }, include: includeOrder }); }); res.json({ success: true, data }); }
export async function dispatchOrder(req: Request, res: Response) {
	const id = idParam(req.params.id);
	const input = dispatchSchema.parse(req.body);
	const data = await prisma.$transaction(async (tx) => {
		const order = await tx.salesOrder.findUnique({ where: { id }, include: { items: true } });
		if (!order || order.status !== SalesOrderStatus.CONFIRMED) {
			throw new HttpError(400, "Only confirmed orders can be dispatched");
		}

		for (const item of order.items) {
			const changed = await tx.$executeRaw`UPDATE "Inventory"
				SET "physicalQty" = "physicalQty" - ${item.quantity},
						"reservedQty" = "reservedQty" - ${item.quantity},
						"updatedAt" = NOW()
				WHERE "productId" = ${item.productId}
					AND "reservedQty" >= ${item.quantity}
					AND "physicalQty" >= ${item.quantity}`;
			if (changed !== 1) throw new HttpError(409, "Reserved inventory is not available for dispatch");
		}

		await tx.dispatch.create({
			data: {
				dispatchNo: number("DSP"),
				salesOrderId: id,
				vehicleNumber: input.vehicleNumber,
				driverName: input.driverName,
				items: {
					create: order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
				},
			},
		});

		return tx.salesOrder.update({
			where: { id },
			data: { status: SalesOrderStatus.DISPATCHED },
			include: includeOrder,
		});
	});
	res.json({ success: true, data });
}
