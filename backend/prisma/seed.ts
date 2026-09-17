import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();
const products = [
  ["IND-A-001", "Industrial Hydraulic Pump", "Hydraulics", "PCS", 18500, 120],
  ["IND-B-002", "Pneumatic Control Valve", "Pneumatics", "PCS", 6400, 240],
  ["IND-C-003", "Stainless Steel Coupling", "Fittings", "PCS", 1250, 600],
  ["IND-D-004", "Variable Frequency Drive", "Electrical", "PCS", 32500, 75],
  ["IND-E-005", "Industrial Pressure Sensor", "Instrumentation", "PCS", 8900, 180],
  ["IND-F-006", "Conveyor Drive Motor", "Material Handling", "PCS", 47200, 45],
] as const;
async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@erp-portal.local" }, update: { passwordHash, role: Role.ADMIN }, create: { name: "ERP Administrator", email: "admin@erp-portal.local", passwordHash, role: Role.ADMIN } });
  await prisma.user.upsert({ where: { email: "sales@erp-portal.local" }, update: { passwordHash, role: Role.SALES_USER }, create: { name: "Sales User", email: "sales@erp-portal.local", passwordHash, role: Role.SALES_USER } });
  const customer = await prisma.customer.upsert({ where: { id: 1 }, update: {}, create: { companyName: "ABC Engineering Pvt. Ltd.", contactPerson: "Ananya Mehta", mobile: "9876543210", email: "purchase@abc-engineering.example", city: "Pune" } });
  for (const [productCode, name, category, unit, basePrice, physicalQty] of products) {
    const product = await prisma.product.upsert({ where: { productCode }, update: { name, category, unit, basePrice }, create: { productCode, name, category, unit, basePrice } });
    await prisma.inventory.upsert({ where: { productId: product.id }, update: { physicalQty }, create: { productId: product.id, physicalQty, reservedQty: 0, damagedQty: 0 } });
  }
  const pump = await prisma.product.findUniqueOrThrow({ where: { productCode: "IND-A-001" } });
  const valve = await prisma.product.findUniqueOrThrow({ where: { productCode: "IND-B-002" } });
  const enquiry = await prisma.enquiry.upsert({
    where: { enquiryNo: "ENQ-DEMO-001" },
    update: { customerId: customer.id, createdById: admin.id, status: "QUOTED", notes: "Demo requirement for production-line spares." },
    create: { enquiryNo: "ENQ-DEMO-001", customerId: customer.id, createdById: admin.id, status: "QUOTED", notes: "Demo requirement for production-line spares.", items: { create: [{ productId: pump.id, quantity: 4 }, { productId: valve.id, quantity: 12 }] } },
  });
  const quotation = await prisma.quotation.upsert({
    where: { quotationNo: "QUO-DEMO-001" },
    update: { enquiryId: enquiry.id, customerId: customer.id, createdById: admin.id, status: "ACCEPTED", subtotal: 150800, discount: 0, tax: 27144, total: 177944, items: { deleteMany: {}, create: [{ productId: pump.id, quantity: 4, unitPrice: 18500, discountPct: 0, taxPct: 18, lineAmount: 87320 }, { productId: valve.id, quantity: 12, unitPrice: 6400, discountPct: 0, taxPct: 18, lineAmount: 90624 }] } },
    create: { quotationNo: "QUO-DEMO-001", enquiryId: enquiry.id, customerId: customer.id, createdById: admin.id, status: "ACCEPTED", subtotal: 150800, discount: 0, tax: 27144, total: 177944, items: { create: [{ productId: pump.id, quantity: 4, unitPrice: 18500, discountPct: 0, taxPct: 18, lineAmount: 87320 }, { productId: valve.id, quantity: 12, unitPrice: 6400, discountPct: 0, taxPct: 18, lineAmount: 90624 }] } },
  });
  await prisma.salesOrder.upsert({
    where: { quotationId: quotation.id },
    update: { orderNo: "ORD-DEMO-001", customerId: customer.id, total: 177944, status: "PENDING", items: { deleteMany: {}, create: [{ productId: pump.id, quantity: 4, unitPrice: 18500 }, { productId: valve.id, quantity: 12, unitPrice: 6400 }] } },
    create: { orderNo: "ORD-DEMO-001", quotationId: quotation.id, customerId: customer.id, total: 177944, status: "PENDING", items: { create: [{ productId: pump.id, quantity: 4, unitPrice: 18500 }, { productId: valve.id, quantity: 12, unitPrice: 6400 }] } },
  });
  console.log(`Seeded ${products.length} products, demo users, and the ENQ-DEMO-001 → QUO-DEMO-001 → ORD-DEMO-001 workflow.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
