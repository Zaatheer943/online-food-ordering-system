import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart, DELIVERY_FEE } from '../context/CartContext.jsx';
import { FoodImage, formatLKR } from '../components/FoodCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const { items, updateQty, removeItem, totals } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-extrabold text-brand-charcoal">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Add some delicious food to get started.</p>
        <Link to="/menu" className="btn-primary inline-block mt-6">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-charcoal">Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.food_id} className="card p-4 flex gap-4 items-center">
              <FoodImage src={item.image} alt={item.food_name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-brand-charcoal truncate">{item.food_name}</h3>
                <p className="text-sm text-gray-500">{formatLKR(item.price)} each</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button className="p-1.5 hover:text-brand-orange" onClick={() => updateQty(item.food_id, item.quantity - 1)}><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button className="p-1.5 hover:text-brand-orange" onClick={() => updateQty(item.food_id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.food_id)} className="text-red-500 hover:text-red-700 p-1.5">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <span className="font-bold text-brand-orange whitespace-nowrap">{formatLKR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-bold text-lg text-brand-charcoal mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatLKR(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span className="font-semibold">{formatLKR(DELIVERY_FEE)}</span></div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-base">
              <span className="font-bold">Total</span><span className="font-extrabold text-brand-orange">{formatLKR(totals.total)}</span>
            </div>
          </div>
          <button
            onClick={() => user ? navigate('/checkout') : navigate('/login', { state: { from: '/checkout' } })}
            className="btn-primary w-full mt-6"
          >
            Proceed to Checkout
          </button>
          <Link to="/menu" className="block text-center text-sm text-gray-500 hover:text-brand-orange mt-3">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
