import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function FoodImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`bg-gradient-to-br from-brand-orange/20 to-brand-yellow/30 flex items-center justify-center ${className}`}>
        <span className="text-4xl">🍽️</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}

export function formatLKR(n) {
  return `LKR ${Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

export default function FoodCard({ food }) {
  const { addItem } = useCart();
  const toast = useToast();

  const handleAdd = () => {
    addItem(food);
    toast.success(`${food.food_name} added to cart`);
  };

  return (
    <div className="card group hover:shadow-lg transition-shadow">
      <Link to={`/food/${food.food_id}`} className="block relative">
        <FoodImage src={food.image} alt={food.food_name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        {!food.availability && (
          <span className="absolute top-3 left-3 badge bg-gray-800 text-white">Unavailable</span>
        )}
        <span className="absolute top-3 right-3 badge bg-white/90 text-brand-charcoal shadow">{food.category_name}</span>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-brand-charcoal">{food.food_name}</h3>
          <span className="text-brand-orange font-extrabold whitespace-nowrap">{formatLKR(food.price)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{food.description}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAdd}
            disabled={!food.availability}
            className="btn-primary flex-1 !py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Plus size={16} /> Add
          </button>
          <Link to={`/food/${food.food_id}`} className="btn-outline !py-2 !px-3">
            <Eye size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
