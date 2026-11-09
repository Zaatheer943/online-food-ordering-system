import { db } from '../database/db.js';
import { createPaymentContext, PAYMENT_METHODS } from '../strategies/index.js';

const DELIVERY_FEE = 250; // LKR

// GET /api/payments/methods — list available payment strategies
export function listPaymentMethods(req, res) {
  res.json(PAYMENT_METHODS);
}

// POST /api/payments/process — run a payment strategy WITHOUT creating an order.
// Useful for demonstrating the Strategy pattern in isolation.
export function processPayment(req, res) {
  const { method, amount, cardHolderName, demoCardNumber } = req.body || {};

  if (!method) return res.status(400).json({ message: 'Payment method is required' });
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ message: 'A valid positive amount is required' });
  }

  try {
    // Runtime strategy selection — no big if/else on payment type here.
    const context = createPaymentContext(method);
    const result = context.execute(numericAmount, { cardHolderName, demoCardNumber });

    if (!result.success) {
      return res.status(402).json({ message: result.message, strategy: context.getStrategyName() });
    }
    res.json({
      message: result.message,
      strategy: context.getStrategyName(),
      transactionId: result.transactionId,
      amount: numericAmount
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

// Internal helper: create an order + items + payment record atomically.
// Payment is executed through PaymentContext (Strategy pattern).
function placeOrder(userId, { items, delivery_address, contact_phone, payment_method, cardHolderName, demoCardNumber }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'At least one item is required', status: 400 };
  }
  if (!delivery_address || !String(delivery_address).trim()) {
    return { error: 'Delivery address is required', status: 400 };
  }
  if (!payment_method) {
    return { error: 'Payment method is required', status: 400 };
  }

  // Resolve cart lines against the database (never trust client prices).
  const lines = [];
  let subtotal = 0;
  for (const item of items) {
    const food = db.prepare('SELECT food_id, food_name, price, availability FROM food_items WHERE food_id = ?')
      .get(item.food_id);
    if (!food) return { error: `Food item ${item.food_id} not found`, status: 400 };
    if (!food.availability) return { error: `"${food.food_name}" is currently unavailable`, status: 400 };
    const qty = Math.floor(Number(item.quantity));
    if (!qty || qty < 1 || qty > 50) return { error: 'Invalid quantity', status: 400 };
    const lineTotal = food.price * qty;
    subtotal += lineTotal;
    lines.push({ food, qty, lineTotal });
  }

  const total = subtotal + DELIVERY_FEE;

  // ---- Strategy pattern in action -------------------------------------
  // Select the payment strategy at runtime and execute it via the context.
  let paymentContext;
  try {
    paymentContext = createPaymentContext(payment_method);
  } catch (e) {
    return { error: e.message, status: 400 };
  }
  const payment = paymentContext.execute(total, { cardHolderName, demoCardNumber });
  if (!payment.success) {
    return { error: payment.message, status: 402 };
  }
  // ----------------------------------------------------------------------

  // Persist order, order items and payment in ONE transaction.
  db.exec('BEGIN IMMEDIATE');
  try {
    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, total_amount, delivery_address, contact_phone, order_status)
      VALUES (?, ?, ?, ?, 'Pending')
    `).run(userId, total, delivery_address.trim(), contact_phone || null);
    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, food_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const { food, qty, lineTotal } of lines) {
      insertItem.run(orderId, food.food_id, qty, food.price, lineTotal);
    }

    db.prepare(`
      INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_ref)
      VALUES (?, ?, 'Completed', ?, ?)
    `).run(orderId, paymentContext.getStrategyName(), total, payment.transactionId);

    db.exec('COMMIT');

    const order = db.prepare(`
      SELECT o.*, p.payment_method, p.transaction_ref FROM orders o
      LEFT JOIN payments p ON p.order_id = o.order_id
      WHERE o.order_id = ?
    `).get(orderId);
    const orderItems = db.prepare(`
      SELECT oi.*, f.food_name, f.image FROM order_items oi
      JOIN food_items f ON f.food_id = oi.food_id WHERE oi.order_id = ?
    `).all(orderId);

    return { order, items: orderItems, payment, status: 201 };
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

// POST /api/orders — customer places an order (payment strategy executed here)
export function createOrder(req, res) {
  const result = placeOrder(req.user.userId, req.body || {});
  if (result.error) return res.status(result.status).json({ message: result.error });
  res.status(result.status).json({
    message: 'Order placed successfully',
    order: result.order,
    items: result.items,
    payment: { method: result.paymentContext ? undefined : undefined, ...result.payment }
  });
}

// GET /api/orders/my-orders — customer's own orders
export function myOrders(req, res) {
  const orders = db.prepare(`
    SELECT o.*, COUNT(oi.order_item_id) AS item_count
    FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.user_id = ? GROUP BY o.order_id ORDER BY o.order_id DESC
  `).all(req.user.userId);
  res.json(orders);
}

// GET /api/orders/my-orders/:id — single order belonging to the customer
export function myOrderDetail(req, res) {
  const order = db.prepare(`
    SELECT o.*, u.name AS customer_name, u.phone AS customer_phone, u.address AS customer_address,
           p.payment_method, p.payment_status, p.transaction_ref
    FROM orders o JOIN users u ON u.user_id = o.user_id
    LEFT JOIN payments p ON p.order_id = o.order_id
    WHERE o.order_id = ? AND o.user_id = ?
  `).get(req.params.id, req.user.userId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const items = db.prepare(`
    SELECT oi.*, f.food_name, f.image, f.category_id FROM order_items oi
    JOIN food_items f ON f.food_id = oi.food_id WHERE oi.order_id = ?
  `).all(req.params.id);
  res.json({ ...order, items });
}

// GET /api/orders — admin: all orders
export function allOrders(req, res) {
  const { status = '' } = req.query;
  const where = status ? 'WHERE o.order_status = ?' : '';
  const params = status ? [status] : [];
  const orders = db.prepare(`
    SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
           COUNT(oi.order_item_id) AS item_count, p.payment_method, p.payment_status
    FROM orders o JOIN users u ON u.user_id = o.user_id
    LEFT JOIN order_items oi ON oi.order_id = o.order_id
    LEFT JOIN payments p ON p.order_id = o.order_id
    ${where} GROUP BY o.order_id ORDER BY o.order_id DESC
  `).all(...params);
  res.json(orders);
}

// GET /api/orders/:id — admin: order detail
export function orderDetail(req, res) {
  const order = db.prepare(`
    SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
           u.address AS customer_address, p.payment_method, p.payment_status, p.transaction_ref
    FROM orders o JOIN users u ON u.user_id = o.user_id
    LEFT JOIN payments p ON p.order_id = o.order_id
    WHERE o.order_id = ?
  `).get(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const items = db.prepare(`
    SELECT oi.*, f.food_name, f.image FROM order_items oi
    JOIN food_items f ON f.food_id = oi.food_id WHERE oi.order_id = ?
  `).all(req.params.id);
  res.json({ ...order, items });
}

// PUT /api/orders/:id/status — admin: update status
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
export function updateOrderStatus(req, res) {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${ORDER_STATUSES.join(', ')}` });
  }
  const info = db.prepare('UPDATE orders SET order_status = ? WHERE order_id = ?').run(status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: 'Order not found' });
  res.json(db.prepare('SELECT * FROM orders WHERE order_id = ?').get(req.params.id));
}
