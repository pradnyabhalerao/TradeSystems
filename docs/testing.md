# Testing

The backend test suite covers:

- Quotation totals with discount and GST
- Draft and rejected quotation order guards
- Unique quotation-to-order behavior
- Reservation beyond available quantity
- Admin-only operations
- Concurrent reservation invariant

Run with `cd backend && npm test`. Database integration tests can be added when a CI PostgreSQL service is configured.
