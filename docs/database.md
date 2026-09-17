# Database Design

Core tables are `User`, `Customer`, `Product`, `Inventory`, `Enquiry`, `EnquiryItem`, `Quotation`, `QuotationItem`, `SalesOrder`, `SalesOrderItem`, `Dispatch`, and `DispatchItem`.

Foreign keys preserve the traceable chain:

`Customer -> Enquiry -> Quotation -> SalesOrder -> Dispatch`

Products connect to enquiry, quotation, order, and dispatch line items. Inventory is one-to-one with Product and has database-backed quantities. Unique constraints prevent duplicate emails, product codes, enquiry numbers, quotation numbers, order numbers, dispatch numbers, and quotation-to-order conversion.

Available quantity is calculated as:

`physicalQty - reservedQty - damagedQty`

```mermaid
erDiagram
  USER ||--o{ ENQUIRY : creates
  USER ||--o{ QUOTATION : creates
  CUSTOMER ||--o{ ENQUIRY : raises
  CUSTOMER ||--o{ QUOTATION : receives
  CUSTOMER ||--o{ SALES_ORDER : places
  ENQUIRY ||--o{ ENQUIRY_ITEM : contains
  PRODUCT ||--o{ ENQUIRY_ITEM : requested
  ENQUIRY ||--o{ QUOTATION : priced_as
  QUOTATION ||--o{ QUOTATION_ITEM : contains
  PRODUCT ||--o{ QUOTATION_ITEM : quoted
  QUOTATION ||--|| SALES_ORDER : converts_to
  SALES_ORDER ||--o{ SALES_ORDER_ITEM : contains
  PRODUCT ||--o{ SALES_ORDER_ITEM : ordered
  PRODUCT ||--|| INVENTORY : has
  SALES_ORDER ||--o| DISPATCH : fulfilled_by
  DISPATCH ||--o{ DISPATCH_ITEM : contains
```
