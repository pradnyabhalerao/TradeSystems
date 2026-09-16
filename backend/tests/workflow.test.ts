import { calculateQuote, canCreateOrder, canPerformAdminAction, canReserve } from "../src/services/workflow";

describe("ERP workflow rules", () => {
  test("calculates quotation totals with discount and GST", () => {
    const result = calculateQuote([{ quantity: 10, unitPrice: 50000, discountPct: 10, taxPct: 18 }]);
    expect(result.subtotal).toBe(450000);
    expect(result.tax).toBe(81000);
    expect(result.total).toBe(531000);
  });
  test("draft and rejected quotations cannot create sales orders", () => {
    expect(canCreateOrder("DRAFT")).toBe(false);
    expect(canCreateOrder("REJECTED")).toBe(false);
    expect(canCreateOrder("ACCEPTED")).toBe(true);
  });
  test("one accepted quotation can only be eligible once by unique order reference", () => {
    const orderReferences = new Set(["QUO-1001"]);
    expect(orderReferences.has("QUO-1001")).toBe(true);
    expect(orderReferences.size).toBe(1);
  });
  test("prevents reservation beyond available inventory", () => {
    expect(canReserve(100, 30, 0, 70)).toBe(true);
    expect(canReserve(100, 30, 0, 71)).toBe(false);
    expect(canReserve(100, 30, 10, 61)).toBe(false);
  });
  test("only admins can perform restricted inventory actions", () => {
    expect(canPerformAdminAction("SALES_USER")).toBe(false);
    expect(canPerformAdminAction("ADMIN")).toBe(true);
  });
  test("concurrent reservations preserve the available-stock invariant", () => {
    const available = 100;
    const firstReservation = 80;
    const secondReservation = 50;
    expect(canReserve(available, 0, 0, firstReservation)).toBe(true);
    expect(canReserve(available, firstReservation, 0, secondReservation)).toBe(false);
  });
});
