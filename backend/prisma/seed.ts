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
  await prisma.user.upsert({ where: { email: "admin@erp-portal.local" }, update: { passwordHash, role: Role.ADMIN }, create: { name: "ERP Administrator", email: "admin@erp-portal.local", passwordHash, role: Role.ADMIN } });
  await prisma.user.upsert({ where: { email: "sales@erp-portal.local" }, update: { passwordHash, role: Role.SALES_USER }, create: { name: "Sales User", email: "sales@erp-portal.local", passwordHash, role: Role.SALES_USER } });
  await prisma.customer.upsert({ where: { id: 1 }, update: {}, create: { companyName: "ABC Engineering Pvt. Ltd.", contactPerson: "Ananya Mehta", mobile: "9876543210", email: "purchase@abc-engineering.example", city: "Pune" } });
  for (const [productCode, name, category, unit, basePrice, physicalQty] of products) {
    const product = await prisma.product.upsert({ where: { productCode }, update: { name, category, unit, basePrice }, create: { productCode, name, category, unit, basePrice } });
    await prisma.inventory.upsert({ where: { productId: product.id }, update: { physicalQty }, create: { productId: product.id, physicalQty, reservedQty: 0, damagedQty: 0 } });
  }
  console.log(`Seeded ${products.length} products and demo users.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
