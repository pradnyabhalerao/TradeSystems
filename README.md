# ForgeFlow ERP

A focused PERN ERP workflow for industrial sales operations:

`Customer Enquiry -> Quotation -> Sales Order -> Inventory Reservation -> Dispatch`

## Stack

- PostgreSQL
- Prisma ORM
- Express.js / Node.js / TypeScript
- React.js / Vite
- JWT authentication, bcrypt password hashing, Zod validation

## Features

- ADMIN and SALES_USER roles enforced by backend middleware
- Relational customer, product, inventory, enquiry, quotation, order, and dispatch data
- Backend quotation calculation with discount and GST
- Conditional transactional inventory reservation safe against concurrent requests
- Damaged inventory support: `available = physical - reserved - damaged`
- Reservation release on cancellation and physical/reserved updates on dispatch
- Responsive screens for Login, Enquiries, Quotations, and Sales Orders
- Six seeded industrial products and demo users
- Six automated workflow tests

## Setup

Requires Node.js 20+ and PostgreSQL 14+.

```bash
cd erp-portal
export PATH="$HOME/.local/node/bin:$PATH"
cp backend/.env.example backend/.env
npm install --prefix backend
npm install --prefix frontend
```

Create a PostgreSQL database named `erp_portal`, then update `backend/.env` if your credentials differ.

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

## Run

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:5000/api/health

## Demo credentials

- Admin: `admin@erp-portal.local` / `Admin@123`
- Sales user: `sales@erp-portal.local` / `Admin@123`

## Tests

```bash
cd backend
npm test
```

## API overview

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET|POST /api/customers`
- `GET /api/products`
- `GET|PATCH /api/inventory`
- `GET|POST /api/enquiries`
- `GET|POST /api/quotations`
- `PATCH /api/quotations/:id/status`
- `GET /api/orders`
- `POST /api/orders/from-quotation/:quotationId`
- `PATCH /api/orders/:id/confirm` (ADMIN)
- `PATCH /api/orders/:id/cancel`
- `POST /api/orders/:id/dispatch` (ADMIN)

See `docs/` for architecture, schema, workflow, API, and testing notes.
