# Database ER Diagram — SQLite

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS {
        int user_id PK
        string name
        string email UK
        string password "bcrypt hash"
        string role "customer | admin"
        string phone
        string address
        datetime created_at
    }
    CATEGORIES ||--o{ FOOD_ITEMS : contains
    CATEGORIES {
        int category_id PK
        string category_name UK
        string description
    }
    FOOD_ITEMS ||--o{ ORDER_ITEMS : "ordered as"
    FOOD_ITEMS {
        int food_id PK
        string food_name
        string description
        real price "LKR"
        string image
        int category_id FK
        int availability "0|1"
        datetime created_at
    }
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o| PAYMENTS : "paid by"
    ORDERS {
        int order_id PK
        int user_id FK
        real total_amount
        string delivery_address
        string contact_phone
        string order_status "Pending|Confirmed|Preparing|Out for Delivery|Delivered|Cancelled"
        datetime created_at
    }
    ORDER_ITEMS {
        int order_item_id PK
        int order_id FK
        int food_id FK
        int quantity
        real unit_price
        real subtotal
    }
    PAYMENTS {
        int payment_id PK
        int order_id FK
        string payment_method "strategy name"
        string payment_status
        real amount
        string transaction_ref
        datetime created_at
    }
```

## Integrity & transactions

- `PRAGMA foreign_keys = ON` enforces referential integrity.
- `ON DELETE CASCADE` on `order_items.order_id`.
- `CHECK` constraints on `role`, `availability`, `quantity`, `price` and `order_status`.
- Placing an order runs inside a single `BEGIN IMMEDIATE … COMMIT` transaction (`orderController.placeOrder`), rolling back on any failure — orders, order items and the payment record are always consistent.
- Prices are **never trusted from the client**: the server re-reads each `food_id` price from `food_items` and recomputes subtotals + delivery fee.
