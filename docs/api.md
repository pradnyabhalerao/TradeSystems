# API Notes

All protected endpoints require `Authorization: Bearer <token>`.

## Authentication

`POST /api/auth/login` accepts `{ email, password }` and returns a JWT plus user role.

## Workflow

`GET|POST /api/customers` lists or creates customers. Customer details include company name, contact person, mobile, email, and city.

`POST /api/enquiries` accepts `customerId`, `items`, `requiredDate`, and `notes`.

`GET /api/products` returns the product master and calculated availability. `GET /api/inventory` returns physical, reserved, damaged, and available stock. `PATCH /api/inventory/:productId` is ADMIN-only.

`POST /api/quotations` accepts an enquiry and pricing lines. The server ignores any client grand total and computes the totals.

`PATCH /api/quotations/:id/status` accepts `DRAFT`, `SENT`, `ACCEPTED`, or `REJECTED`.

`POST /api/orders/from-quotation/:quotationId` converts accepted quotations. The database unique constraint makes conversion idempotently reject duplicate attempts.

`PATCH /api/orders/:id/confirm` is admin-only and reserves inventory transactionally.

`PATCH /api/orders/:id/cancel` cancels a pending or confirmed order and releases reservations when applicable.

`POST /api/orders/:id/dispatch` is admin-only and accepts `vehicleNumber` and `driverName`.

Errors use `{ success: false, message, errors? }` and status codes 400, 401, 403, 404, 409, or 500.
