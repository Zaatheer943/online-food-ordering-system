# Test Results

All tests executed against the running system (backend `http://localhost:5000`, frontend `http://localhost:5173`) on 2026-11-09.

## Automated API tests (executed via curl)

| # | Test Case | Request | Expected | Result |
|---|-----------|---------|----------|--------|
| 1 | Customer registration | `POST /api/auth/register` | 201 + JWT + user | ✅ Passed |
| 2 | Customer login | `POST /api/auth/login` | 200 + JWT | ✅ Passed |
| 3 | Invalid login | wrong password | 401 "Invalid email or password" | ✅ Passed |
| 4 | Duplicate email | register same email | 409 conflict | ✅ Passed |
| 5 | Food menu display | `GET /api/foods` | 19 seeded items with category names | ✅ Passed |
| 6 | Food search | `GET /api/foods?search=chicken` | filtered list | ✅ Passed |
| 7 | Category filter | `GET /api/foods?category=2` | only pizza items | ✅ Passed |
| 8 | Food details | `GET /api/foods/1` | single item + category | ✅ Passed |
| 9 | Add to cart / qty / remove | CartContext (client) | totals update; persisted in localStorage | ✅ Passed (UI verified) |
| 10 | Order total calculation | order with 2×Chicken Burger (850) + 1×OJ (300) + fee 250 | total = 2250 | ✅ Passed — server returned 2250 |
| 11 | Cash on Delivery | `payment_method:"cod"` | strategy `CashOnDeliveryStrategy`, ref `COD-…`, payment row saved | ✅ Passed |
| 12 | Mock Card Payment | `payment_method:"card"` + holder name | strategy `MockCardPaymentStrategy`, ref `CARD-…` | ✅ Passed |
| 13 | Card missing holder name | card without name | 402 error, no order created | ✅ Passed |
| 14 | Order placement | `POST /api/orders` | 201, order + items + payment in one transaction | ✅ Passed |
| 15 | Order history | `GET /api/orders/my-orders` | customer's own orders only | ✅ Passed |
| 16 | Order tracking | `GET /api/orders/my-orders/:id` | items, totals, payment ref, status | ✅ Passed |
| 17 | Admin stats | `GET /api/admin/stats` | totals, revenue, status breakdown, recent orders | ✅ Passed |
| 18 | Admin food management | POST/PUT/DELETE `/api/foods` as admin | create/edit/delete work | ✅ Passed |
| 19 | Admin category management | GET/POST/PUT/DELETE `/api/categories` | CRUD + delete-guard when items exist | ✅ Passed |
| 20 | Admin order management | `GET /api/orders`, `PUT /api/orders/:id/status` | list, filter, status update to "Preparing" | ✅ Passed |
| 21 | Admin customers | `GET /api/admin/customers` | list with order counts & spend | ✅ Passed |
| 22 | Unauthorized food write | POST `/api/foods` no token | 401 | ✅ Passed |
| 23 | Customer blocked from admin orders | `GET /api/orders` as customer | 403 Forbidden | ✅ Passed |
| 24 | Strategy demo endpoint | `POST /api/payments/process` cod & card | correct strategy name + transaction ref | ✅ Passed |
| 25 | Client build | `npm run build` (Vite) | production build succeeds | ✅ Passed |

## Manual UI verification

- Home hero, category cards, featured items render.
- Menu search box + category pills filter correctly; empty state shows.
- Cart quantity +/-, remove, order summary with LKR totals.
- Checkout: delivery form, COD/Card selection, card-holder field appears only for card.
- Order confirmation screen with transaction reference.
- Order tracking page shows the 5-step status stepper.
- Admin sidebar: dashboard stats, food/category CRUD modals, order status dropdowns, customer table.

## Fixes applied during testing

- Corrected route ordering (`/my-orders` before `/:id`) so customer routes aren't shadowed.
- Server recomputes prices from DB (client-supplied prices ignored) — verified totals match.
