import { db } from '../database/db.js';

export function listCategories(req, res) {
  const rows = db.prepare(`
    SELECT c.*, COUNT(f.food_id) AS item_count
    FROM categories c LEFT JOIN food_items f ON f.category_id = c.category_id
    GROUP BY c.category_id ORDER BY c.category_id
  `).all();
  res.json(rows);
}

export function createCategory(req, res) {
  const { category_name, description } = req.body || {};
  if (!category_name || !String(category_name).trim()) {
    return res.status(400).json({ message: 'category_name is required' });
  }
  try {
    const result = db.prepare('INSERT INTO categories (category_name, description) VALUES (?, ?)')
      .run(category_name.trim(), description || '');
    res.status(201).json(db.prepare('SELECT * FROM categories WHERE category_id = ?').get(result.lastInsertRowid));
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(409).json({ message: 'Category already exists' });
    }
    throw e;
  }
}

export function updateCategory(req, res) {
  const existing = db.prepare('SELECT * FROM categories WHERE category_id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });
  const b = req.body || {};
  try {
    db.prepare('UPDATE categories SET category_name=?, description=? WHERE category_id=?')
      .run(b.category_name ?? existing.category_name, b.description ?? existing.description, req.params.id);
    res.json(db.prepare('SELECT * FROM categories WHERE category_id = ?').get(req.params.id));
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    throw e;
  }
}

export function deleteCategory(req, res) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM food_items WHERE category_id = ?').get(req.params.id).n;
  if (count > 0) {
    return res.status(409).json({ message: `Cannot delete: ${count} food item(s) still use this category` });
  }
  const info = db.prepare('DELETE FROM categories WHERE category_id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category deleted' });
}
