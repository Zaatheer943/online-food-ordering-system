import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Phone, CreditCard, ArrowLeft } from 'lucide-react';
import { orderApi } from '../services/api.js';
import { formatLKR, FoodImage } from '../components/FoodCard.jsx';
import { StatusBadge } from './Dashboard.jsx';

// Ordered pipeline for the visual stepper (Cancelled is terminal/off-flow)
const STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.myOrder(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-gray-400">Loading…</div>;
  if (!order) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Order not found.</div>;

  const currentIdx = STEPS.indexOf(order.order_status);
  const isCancelled = order.order_status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-orange mb-6">
        <ArrowLeft size={16} /> All Orders
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-charcoal">Order #{order.order_id}</h1>
            <p className="text-sm text-gray-400">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <StatusBadge status={order.order_status} />
        </div>

        {/* Status stepper */}
        {!isCancelled ? (
          <div className="flex items-center mt-8 overflow-x-auto pb-2">
            {STEPS.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <div key={s} className="flex items-center flex-1 min-w-[110px]">
                  <div className="flex flex-col items-center">
                    <div className={`stepper-dot ${done ? 'bg-brand-orange border-brand-orange text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                      {done ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <span className={`text-[11px] mt-2 font-medium text-center ${done ? 'text-brand-charcoal' : 'text-gray-400'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentIdx ? 'bg-brand-orange' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-red-600 font-semibold">This order was cancelled.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Items */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((i) => (
              <div key={i.order_item_id} className="flex items-center gap-3">
                <FoodImage src={i.image} alt={i.food_name} className="w-12 h-12 rounded-lg object-cover" />
                <span className="flex-1 text-sm font-medium">{i.food_name} × {i.quantity}</span>
                <span className="text-sm font-semibold">{formatLKR(i.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatLKR(order.items.reduce((s, i) => s + i.subtotal, 0))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span>{formatLKR(order.total_amount - order.items.reduce((s, i) => s + i.subtotal, 0))}</span></div>
            <div className="flex justify-between font-extrabold text-brand-orange pt-1"><span>Total</span><span>{formatLKR(order.total_amount)}</span></div>
          </div>
        </div>

        {/* Delivery & payment */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin size={18} className="text-brand-orange" /> Delivery</h2>
            <p className="text-sm text-gray-600">{order.delivery_address}</p>
            {order.contact_phone && <p className="text-sm text-gray-600 mt-1 flex items-center gap-2"><Phone size={14} /> {order.contact_phone}</p>}
          </div>
          <div className="card p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2"><CreditCard size={18} className="text-brand-orange" /> Payment</h2>
            <p className="text-sm text-gray-600">{order.payment_method}</p>
            {order.transaction_ref && <p className="text-xs text-gray-400 mt-1">Ref: {order.transaction_ref}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
