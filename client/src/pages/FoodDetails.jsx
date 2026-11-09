import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ArrowLeft, ShoppingCart } from 'lucide-react';
import { foodApi } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { FoodImage, formatLKR } from '../components/FoodCard.jsx';

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();
  const [food, setFood] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    foodApi.get(id).then(setFood).catch(() => setFood(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-gray-400">Loading…</div>;
  if (!food) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-400">Food item not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-orange mb-6">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="grid md:grid-cols-2 gap-8">
        <FoodImage src={food.image} alt={food.food_name} className="w-full h-80 md:h-96 object-cover rounded-2xl" />
        <div>
          <span className="badge bg-brand-orange/10 text-brand-orange">{food.category_name}</span>
          <h1 className="text-3xl font-extrabold text-brand-charcoal mt-3">{food.food_name}</h1>
          <p className="text-2xl font-extrabold text-brand-orange mt-2">{formatLKR(food.price)}</p>
          <p className="text-gray-600 mt-4 leading-relaxed">{food.description}</p>
          <p className={`mt-4 badge ${food.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {food.availability ? 'Available' : 'Currently unavailable'}
          </p>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-gray-300 rounded-xl">
              <button className="p-3 hover:text-brand-orange" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={18} /></button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button className="p-3 hover:text-brand-orange" onClick={() => setQty(qty + 1)}><Plus size={18} /></button>
            </div>
            <button
              disabled={!food.availability}
              onClick={() => { addItem(food, qty); toast.success(`${qty} × ${food.food_name} added to cart`); navigate('/cart'); }}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart size={18} /> Add to Cart — {formatLKR(food.price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
