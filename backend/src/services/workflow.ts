export type QuoteLine = { quantity: number; unitPrice: number; discountPct: number; taxPct: number };
export function calculateQuote(lines: QuoteLine[]) {
  const items = lines.map((line) => {
    const baseAmount = line.quantity * line.unitPrice;
    const discountAmount = baseAmount * (line.discountPct / 100);
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = taxableAmount * (line.taxPct / 100);
    return { ...line, baseAmount, discountAmount, taxAmount, lineAmount: taxableAmount + taxAmount };
  });
  const subtotal = items.reduce((sum, item) => sum + item.baseAmount - item.discountAmount, 0);
  const discount = items.reduce((sum, item) => sum + item.discountAmount, 0);
  const tax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  return { items, subtotal, discount, tax, total: subtotal + tax };
}
export function canCreateOrder(status: string) { return status === "ACCEPTED"; }
export function canReserve(physicalQty: number, reservedQty: number, damagedQty: number, requestedQty: number) { return requestedQty > 0 && physicalQty >= 0 && reservedQty >= 0 && damagedQty >= 0 && physicalQty - reservedQty - damagedQty >= requestedQty; }
export function canPerformAdminAction(role: string) { return role === "ADMIN"; }
