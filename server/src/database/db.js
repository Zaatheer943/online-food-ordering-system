import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'food_ordering.db'));

db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  phone       TEXT,
  address     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  category_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name   TEXT NOT NULL UNIQUE,
  description     TEXT
);

CREATE TABLE IF NOT EXISTS food_items (
  food_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  food_name     TEXT NOT NULL,
  description   TEXT,
  price         REAL NOT NULL CHECK (price >= 0),
  image         TEXT,
  category_id   INTEGER NOT NULL REFERENCES categories(category_id),
  availability  INTEGER NOT NULL DEFAULT 1 CHECK (availability IN (0,1)),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  order_id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL REFERENCES users(user_id),
  total_amount      REAL NOT NULL,
  delivery_address  TEXT NOT NULL,
  contact_phone     TEXT,
  order_status      TEXT NOT NULL DEFAULT 'Pending'
                   CHECK (order_status IN ('Pending','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  food_id       INTEGER NOT NULL REFERENCES food_items(food_id),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  unit_price    REAL NOT NULL,
  subtotal      REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id        INTEGER REFERENCES orders(order_id),
  payment_method  TEXT NOT NULL,
  payment_status  TEXT NOT NULL DEFAULT 'Completed',
  amount          REAL NOT NULL,
  transaction_ref TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_food_category ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

export default db;
