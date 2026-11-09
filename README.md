# Online Food Ordering System

**CA05 — System Development Using Software Architecture and Design Patterns**

A full-stack food ordering platform demonstrating:

- **Architecture:** Client–Server Architecture
- **Design Pattern:** Strategy Design Pattern (payment processing)

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React.js + Vite + Tailwind CSS + Lucide React |
| Backend  | Node.js + Express.js (REST API) |
| Database | SQLite (via Node's built-in `node:sqlite`) |
| Auth     | JWT + bcrypt |
| Language | JavaScript (ES Modules) |

## Project Structure

```
online-food-ordering-system/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Navbar, Footer, FoodCard, ProtectedRoute
│       ├── pages/           # Customer pages
│       ├── pages/admin/     # Admin pages
│       ├── context/         # AuthContext, CartContext, ToastContext
│       └── services/api.js  # Axios REST client
├── server/                  # Express backend
│   └── src/
│       ├── config/          # (reserved)
│       ├── controllers/     # Route handlers / business logic
│       ├── routes/          # REST endpoint definitions
│       ├── middleware/      # JWT auth + role authorization
│       ├── models/          # (data access lives in controllers via db.js)
│       ├── strategies/      # ★ Strategy Pattern: payment strategies
│       ├── database/        # SQLite schema + seed data
│       └── services/        # (reserved)
├── docs/                    # Architecture, UML, ER diagrams, testing
└── README.md
```

## Getting Started

### Prerequisites
- Node.js ≥ 18 (developed on Node 24)

### Install

```bash
npm install --prefix server
npm install --prefix client
```

### Run

```bash
# Terminal 1 — backend API  → http://localhost:5000
npm run server

# Terminal 2 — frontend     → http://localhost:5173
npm run client
```

Or run both at once:

```bash
npm install        # root (installs concurrently)
npm run dev        # starts server + client together
```

The SQLite database (`server/src/data/food_ordering.db`) and demo data are created automatically on first server start.

## Demo Accounts

| Role     | Email                | Password   |
|----------|----------------------|------------|
| Admin    | admin@foodorder.com  | admin123   |
| Customer | register your own    | —          |

## Features

### Customer
- Register / login (JWT, bcrypt-hashed passwords)
- Browse menu, search by name, filter by category
- Food details, add to cart, quantity controls
- Checkout with delivery details + payment method
- **Cash on Delivery** or **simulated Card payment** (Strategy pattern)
- Order confirmation, history, live status tracking, profile

### Admin (`/admin`)
- Dashboard: total orders, customers, food items, revenue, order statistics
- Food CRUD, category CRUD
- Order list with status filter, order details, status updates
  (`Pending → Confirmed → Preparing → Out for Delivery → Delivered / Cancelled`)
- Customer list with order counts and spend

## REST API Summary

| Method | Endpoint                    | Access      |
|--------|-----------------------------|-------------|
| POST   | /api/auth/register          | Public      |
| POST   | /api/auth/login             | Public      |
| GET    | /api/foods, /api/foods/:id  | Public      |
| POST/PUT/DELETE | /api/foods(/:id)      | Admin       |
| GET    | /api/categories             | Public      |
| POST/PUT/DELETE | /api/categories(/:id) | Admin       |
| POST   | /api/orders                 | Customer    |
| GET    | /api/orders/my-orders(/:id) | Customer    |
| GET    | /api/orders, /api/orders/:id| Admin       |
| PUT    | /api/orders/:id/status      | Admin       |
| GET    | /api/payments/methods       | Public      |
| POST   | /api/payments/process       | Authenticated |
| GET/PUT| /api/profile                | Authenticated |
| GET    | /api/admin/stats, /customers| Admin       |

## Documentation

- [Client–Server Architecture](docs/architecture.md)
- [Strategy Pattern UML](docs/strategy-pattern.md)
- [Database ER Diagram](docs/database-er.md)
- [Test Results](docs/testing.md)

## Notes

- Card payment is **simulated for academic demonstration only** — no real card numbers, CVV or banking data is collected or stored.
- All prices are in **Sri Lankan Rupees (LKR)**.
