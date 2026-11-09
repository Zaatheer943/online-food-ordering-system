import { db } from '../database/db.js';

// GET /api/admin/stats — dashboard statistics
export function stats(req, res) {
  const totalOrders = db.prepare('SELECT COUNT(*) AS n FROM orders').get().n;
  const totalCustomers = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='customer'").get().n;
  const totalFoods = db.prepare('SELECT COUNT(*) AS n FROM food_items').get().n;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount),0) AS s FROM orders WHERE order_status != 'Cancelled'").get().s;

  const byStatus = db.prepare('SELECT order_status AS status, COUNT(*) AS count FROM orders GROUP BY order_status').all();
  const recentOrders = db.prepare(`
    SELECT o.order_id, o.total_amount, o.order_status, o.created_at, u.name AS customer_name
    FROM orders o JOIN users u ON u.user_id = o.user_id
    ORDER BY o.order_id DESC LIMIT 5
  `).all();

  res.json({ totalOrders, totalCustomers, totalFoods, totalRevenue, byStatus, recentOrders });
}

// GET /api/admin/customers — customer list with order counts
export function customers(req, res) {
  const rows = db.prepare(`
    SELECT u.user_id, u.name, u.email, u.phone, u.address, u.created_at,
           COUNT(o.order_id) AS order_count, COALESCE(SUM(o.total_amount),0) AS total_spent
    FROM users u LEFT JOIN orders o ON o.user_id = u.user_id
    WHERE u.role = 'customer'
    GROUP BY u.user_id ORDER BY u.user_id DESC
  `).all();
  res.json(rows);
}
