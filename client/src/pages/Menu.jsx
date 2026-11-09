import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { foodApi, categoryApi } from '../services/api.js';
import FoodCard from '../components/FoodCard.jsx';

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');

  const category = params.get('category') || '';

  useEffect(() => { categoryApi.list().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const q = {};
    if (params.get('search')) q.search = params.get('search');
    if (category) q.category = category;
    foodApi.list(q)
      .then(setFoods)
      .catch(() => setFoods([]))
      .finally(() => setLoading(false));
  }, [params, category]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return foods;
    return foods.filter((f) => f.food_name.toLowerCase().includes(term));
  }, [foods, search]);

  const selectCategory = (id) => {
    const next = new URLSearchParams(params);
    if (id) next.set('category', id); else next.delete('category');
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-charcoal">Our Menu</h1>
      <p className="text-gray-500 mt-1">Browse {foods.length} delicious dishes — prices in LKR.</p>

      <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input !pl-11"
            placeholder="Search food items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SlidersHorizontal size={16} /> Filter:
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => selectCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${!category ? 'bg-brand-charcoal text-white' : 'bg-white border border-gray-200 hover:border-brand-orange'}`}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.category_id} onClick={() => selectCategory(c.category_id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${String(category) === String(c.category_id) ? 'bg-brand-orange text-white' : 'bg-white border border-gray-200 hover:border-brand-orange'}`}>
              {c.category_name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card h-72 animate-pulse bg-gray-100" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="font-semibold">No food items found</p>
          <p className="text-sm">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {visible.map((f) => <FoodCard key={f.food_id} food={f} />)}
        </div>
      )}
    </div>
  );
}
