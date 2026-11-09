import bcrypt from 'bcryptjs';
import { db } from './db.js';

// Idempotent seed: safe to run multiple times.

const img = (id) => `https://images.unsplash.com/${id}?w=600&q=80&auto=format&fit=crop`;

const categories = [
  ['Burgers',       'Juicy grilled burgers and sandwiches'],
  ['Pizza',         'Stone-baked pizzas with fresh toppings'],
  ['Rice & Kottu',  'Traditional Sri Lankan rice dishes and kottu'],
  ['Pasta',         'Italian-style pasta dishes'],
  ['Sandwiches',    'Fresh club sandwiches and subs'],
  ['Beverages',     'Fresh juices, shakes and drinks'],
  ['Sides',         'Fries, nuggets and snack sides'],
  ['Desserts',      'Sweet treats to finish your meal']
];

const foods = [
  ['Chicken Burger',        'Grilled chicken breast patty with lettuce, tomato, cheese and house sauce in a toasted brioche bun.', 850,  'Burgers',       img('photo-1568901346375-23c9450c58cd'), 1],
  ['Cheese Pizza',          'Classic margherita-style pizza loaded with mozzarella and tomato sauce on a crispy base.',            1200, 'Pizza',         img('photo-1513104890138-7c749659a591'), 1],
  ['Chicken Fried Rice',    'Wok-tossed fried rice with tender chicken pieces, vegetables and a hint of soy sauce.',               650,  'Rice & Kottu',  img('photo-1603133872878-684f208fb84b'), 1],
  ['Chicken Kottu',          'Sri Lankan-style chopped roti stir-fried with chicken, vegetables and aromatic spices.',               550,  'Rice & Kottu',  img('photo-1585032226651-759b368d7246'), 1],
  ['Seafood Rice',          'Fragrant basmati rice cooked with mixed seafood, saffron and fresh herbs.',                           950,  'Rice & Kottu',  img('photo-1534422298391-e81e29d3290d'), 1],
  ['Chicken Pasta',         'Creamy alfredo pasta tossed with grilled chicken and parmesan cheese.',                              780,  'Pasta',         img('photo-1621996346565-e3dbc646d9a9'), 1],
  ['Club Sandwich',         'Triple-decker sandwich with roasted chicken, egg, lettuce, tomato and mayo.',                         600,  'Sandwiches',    img('photo-1528735602780-2552fd46c7af'), 1],
  ['French Fries',          'Crispy golden fries seasoned with sea salt. Perfect as a side.',                                      250,  'Sides',         img('photo-1541592106381-b31e9677c0e5'), 1],
  ['Fresh Orange Juice',    'Freshly squeezed orange juice, no added sugar.',                                                      300,  'Beverages',     img('photo-1621506289937-a8e4df240d0b'), 1],
  ['Chocolate Milkshake',   'Thick and creamy chocolate milkshake topped with whipped cream.',                                     450,  'Beverages',     img('photo-1572490122747-3968b75cc699'), 1],
  ['Veggie Burger',         'Plant-based patty with avocado, lettuce and chipotle mayo.',                                          700,  'Burgers',       img('photo-1551782450-a2132b4ba21d'), 1],
  ['Margherita Pizza',      'Tomato, fresh basil and mozzarella on a thin crispy crust.',                                          1100, 'Pizza',         img('photo-1574071318508-1cdbab80d002'), 1],
  ['Beef Kottu',            'Spicy beef kottu with peppers, onions and curry leaves.',                                             600,  'Rice & Kottu',  img('photo-1565557623262-b51c2513a641'), 1],
  ['Penne Arrabbiata',      'Penne pasta in a spicy tomato and garlic arrabbiata sauce.',                                         700,  'Pasta',         img('photo-1551183053-bf91a1d81141'), 1],
  ['Veggie Sandwich',       'Grilled vegetables, hummus and greens in artisan bread.',                                            450,  'Sandwiches',    img('photo-1509722747041-616f39b57569'), 1],
  ['Mango Juice',           'Refreshing mango juice made from ripe Alphonso mangoes.',                                             350,  'Beverages',     img('photo-1546173159-315724a31696'), 1],
  ['Onion Rings',           'Beer-battered crispy onion rings with dipping sauce.',                                               350,  'Sides',         img('photo-1639024473926-9f7b07d57bdc'), 1],
  ['Cheesecake',            'New York style baked cheesecake with berry compote.',                                                 550,  'Desserts',      img('photo-1533134242443-d4fd215305ad'), 1],
  ['Brownie',               'Warm fudge brownie with vanilla ice cream.',                                                          400,  'Desserts',      img('photo-1606313564200-e75d5e30476c'), 1]
];

export function seed() {
  const catId = {};
  const insCat = db.prepare('INSERT OR IGNORE INTO categories (category_name, description) VALUES (?, ?)');
  const getCat = db.prepare('SELECT category_id FROM categories WHERE category_name = ?');
  for (const [name, desc] of categories) {
    insCat.run(name, desc);
    catId[name] = getCat.get(name).category_id;
  }

  const insFood = db.prepare(`
    INSERT INTO food_items (food_name, description, price, image, category_id, availability)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const existsFood = db.prepare('SELECT food_id FROM food_items WHERE food_name = ?');
  let added = 0;
  for (const [name, desc, price, cat, image, avail] of foods) {
    if (!existsFood.get(name)) {
      insFood.run(name, desc, price, image, catId[cat], avail);
      added++;
    }
  }

  // Admin account: admin@foodorder.com / admin123
  const existsAdmin = db.prepare("SELECT user_id FROM users WHERE email = 'admin@foodorder.com'").get();
  if (!existsAdmin) {
    db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`)
      .run('Administrator', 'admin@foodorder.com', bcrypt.hashSync('admin123', 10));
  }

  console.log(`Seed complete: ${Object.keys(catId).length} categories, ${added} new food items.`);
  console.log('Admin login -> email: admin@foodorder.com  password: admin123');
}

// Auto-seed when run directly:  node src/database/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed();
}
