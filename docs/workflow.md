# Business Workflow

1. A sales user logs in and creates an enquiry for a customer and one or more products.
2. A sales user prices the enquiry. The API calculates discount, GST, subtotal, and total.
3. The quotation is sent and accepted or rejected.
4. Only an accepted quotation can create one sales order. The unique quotation relation prevents duplicates.
5. An admin confirms a pending order. Each inventory row is updated only when available stock is sufficient inside one transaction.
6. A confirmed order can be cancelled to release reservations or dispatched to decrease physical and reserved quantities.
7. Dispatch is rejected for cancelled, pending, duplicate, or under-reserved orders.
