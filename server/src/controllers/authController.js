import bcrypt from 'bcryptjs';
import { db } from '../database/db.js';
import { signToken } from '../middleware/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function register(req, res) {
  const { name, email, password, phone, address } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hash = bcrypt.hashSync(String(password), 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name.trim(), email.toLowerCase(), hash, 'customer', phone || null, address || null);

  const user = db.prepare('SELECT user_id, name, email, role, phone, address FROM users WHERE user_id = ?')
    .get(result.lastInsertRowid);

  const token = signToken({ userId: user.user_id, role: user.role });
  res.status(201).json({ message: 'Registration successful', token, user });
}

export function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken({ userId: user.user_id, role: user.role });
  res.json({
    message: 'Login successful',
    token,
    user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address }
  });
}
