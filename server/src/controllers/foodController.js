import { db } from '../database/db.js';

// GET /api/foods?search=&category=&available=
export function listFoods(req, res) {
  const { search = '', category = '', available = '' } = req.query;
  const clauses = [];
  const params = [];

  if (search) { clauses.push('f.food_name LIKE ?'); params.push(`%${search}%`); }
  if (category) { clauses.push('f.category_id = ?'); params.push(Number(category)); }
  if (available !== '') { clauses.push('f.availability = ?'); params.push(Number(available)); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const foods = db.prepare(`
    SELECT f.food_id, f.food_name, f.description, f.price, f.image,
           f.category_id, f.availability, c.category_name
    FROM food_items f JOIN categories c ON c.category_id = f.category_id
    ${where} ORDER BY f.food_id
  `).all(...params);

  res.json(foods);
}

// GET /api/foods/:id
export function getFood(req, res) {
  const food = db.prepare(`
    SELECT f.*, c.category_name FROM food_items f
    JOIN categories c ON c.category_id = f.category_id
    WHERE f.food_id = ?
  `).get(req.params.id);
  if (!food) return res.status(404).json({ message: 'Food item not found' });
  res.json(food);
}

// POST /api/foods  (admin)
export function createFood(req, res) {
  const { food_name, description, price, image, category_id, availability } = req.body || {};
  if (!food_name || price == null || !category_id) {
    return res.status(400).json({ message: 'food_name, price and category_id are required' });
  }
  const cat = db.prepare('SELECT category_id FROM categories WHERE category_id = ?').get(category_id);
  if (!cat) return res.status(400).json({ message: 'Invalid category_id' });

  const result = db.prepare(`
    INSERT INTO food_items (food_name, description, price, image, category_id, availability)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(food_name, description || '', Number(price), image || '', category_id,
         availability === false || availability === 0 ? 0 : 1);

  res.status(201).json(db.prepare('SELECT * FROM food_items WHERE food_id = ?').get(result.lastInsertRowid));
}

// PUT /api/foods/:id  (admin)
export function updateFood(req, res) {
  const existing = db.prepare('SELECT * FROM food_items WHERE food_id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Food item not found' });

  const b = req.body || {};
  const food = {
    food_name: b.food_name ?? existing.food_name,
    description: b.description ?? existing.description,
    price: b.price != null ? Number(b.price) : existing.price,
    image: b.image ?? existing.image,
    category_id: b.category_id ?? existing.category_id,
    availability: b.availability !== undefined ? (b.availability ? 1 : 0) : existing.availability
  };

  db.prepare(`
    UPDATE food_items SET food_name=?, description=?, price=?, image=?, category_id=?, availability=?
    WHERE food_id=?
  `).run(food.food_name, food.description, food.price, food.image, food.category_id, food.availability, req.params.id);

  res.json(db.prepare('SELECT * FROM food_items WHERE food_id = ?').get(req.params.id));
}

// DELETE /api/foods/:id  (admin)
export function deleteFood(req, res) {
  const info = db.prepare('DELETE FROM food_items WHERE food_id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: 'Food item not found' });
  res.json({ message: 'Food item deleted' });
}
