import bcrypt from 'bcryptjs';
import { db } from '../database/db.js';

// GET /api/profile
export function getProfile(req, res) {
  const user = db.prepare('SELECT user_id, name, email, role, phone, address, created_at FROM users WHERE user_id = ?')
    .get(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

// PUT /api/profile — update own profile (name, phone, address; password optional)
export function updateProfile(req, res) {
  const { name, phone, address, password } = req.body || {};
  const existing = db.prepare('SELECT * FROM users WHERE user_id = ?').get(req.user.userId);
  if (!existing) return res.status(404).json({ message: 'User not found' });

  let hash = existing.password;
  if (password) {
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    hash = bcrypt.hashSync(String(password), 10);
  }

  db.prepare('UPDATE users SET name=?, phone=?, address=?, password=? WHERE user_id=?')
    .run(name ?? existing.name, phone ?? existing.phone, address ?? existing.address, hash, req.user.userId);

  res.json(db.prepare('SELECT user_id, name, email, role, phone, address FROM users WHERE user_id = ?').get(req.user.userId));
}
