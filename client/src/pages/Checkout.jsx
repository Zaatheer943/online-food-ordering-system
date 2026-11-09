import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { orderApi, paymentApi, profileApi } from '../services/api.js';
import { formatLKR, FoodImage } from '../components/FoodCard.jsx';

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({
    delivery_address: user?.address || '',
    contact_phone: user?.phone || '',
    payment_method: 'cod',
    cardHolderName: user?.name || '',
    demoCardNumber: ''
  });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    paymentApi.methods().then(setMethods).catch(() => {});
    profileApi.get().then((p) => setForm((f) => ({
      ...f,
      delivery_address: f.delivery_address || p.address || '',
      contact_phone: f.contact_phone || p.phone || '',
      cardHolderName: f.cardHolderName || p.name || ''
    }))).catch(() => {});
  }, []);

  if (items.length === 0 && !placed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <button onClick={() => navigate('/menu')} className="btn-primary mt-4">Browse Menu</button>
      </div>
    );
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!form.delivery_address.trim()) return toast.error('Delivery address is required');
    if (!form.contact_phone.trim()) return toast.error('Contact phone is required');
    if (form.payment_method === 'card' && !form.cardHolderName.trim()) {
      return toast.error('Card holder name is required');
    }
    setPlacing(true);
    try {
      const res = await orderApi.create({
        items: items.map((i) => ({ food_id: i.food_id, quantity: i.quantity })),
        delivery_address: form.delivery_address,
        contact_phone: form.contact_phone,
        payment_method: form.payment_method,
        cardHolderName: form.cardHolderName,
        demoCardNumber: form.demoCardNumber || undefined
      });
      setPlaced(res);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  // ---- Order confirmation screen -------------------------------------
  if (placed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-extrabold text-brand-charcoal">Order Confirmed!</h1>
        <p className="text-gray-500 mt-2">Order #{placed.order.order_id} has been placed successfully.</p>

        <div className="card p-6 mt-8 text-left">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Payment</span>
            <span className="font-semibold">{placed.payment.method} — {placed.payment.transactionId}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-brand-orange">{formatLKR(placed.order.total_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="badge bg-yellow-100 text-yellow-800">{placed.order.order_status}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <button onClick={() => navigate(`/orders/${placed.order.order_id}`)} className="btn-primary">Track Order</button>
          <button onClick={() => navigate('/menu')} className="btn-outline">Back to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-charcoal">Checkout</h1>
      <form onSubmit={placeOrder} className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Delivery details */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg">Delivery Details</h2>
          <div>
            <label className="text-sm font-medium text-gray-600">Delivery Address *</label>
            <textarea className="input mt-1" rows="3" value={form.delivery_address} onChange={set('delivery_address')} placeholder="Street, city, area…" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Contact Phone *</label>
            <input className="input mt-1" value={form.contact_phone} onChange={set('contact_phone')} placeholder="07X XXX XXXX" />
          </div>
        </div>

        {/* Payment method — Strategy pattern selection */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg">Payment Method</h2>
          {methods.map((m) => (
            <label key={m.key} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${form.payment_method === m.key ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="payment" className="mt-1 accent-brand-orange" checked={form.payment_method === m.key} onChange={() => setForm({ ...form, payment_method: m.key })} />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  {m.key === 'cod' ? <Banknote size={18} className="text-brand-orange" /> : <CreditCard size={18} className="text-brand-orange" />}
                  {m.label}
                </span>
                <span className="block text-sm text-gray-500 mt-0.5">{m.description}</span>
              </span>
            </label>
          ))}

          {form.payment_method === 'card' && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="text-sm font-medium text-gray-600">Card Holder Name *</label>
                <input className="input mt-1" value={form.cardHolderName} onChange={set('cardHolderName')} placeholder="Name on card" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Demo Card Number (optional)</label>
                <input className="input mt-1" value={form.demoCardNumber} onChange={set('demoCardNumber')} placeholder="4111 1111 1111 1111 (any demo value)" />
                <p className="text-xs text-gray-400 mt-1">Simulated payment — no real card data is stored.</p>
              </div>
            </div>
          )}
        </div>

        {/* Items + summary */}
        <div className="md:col-span-2 card p-6">
          <h2 className="font-bold text-lg mb-4">Your Order</h2>
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.food_id} className="flex items-center gap-3">
                <FoodImage src={i.image} alt={i.food_name} className="w-12 h-12 rounded-lg object-cover" />
                <span className="flex-1 text-sm font-medium">{i.food_name} × {i.quantity}</span>
                <span className="text-sm font-semibold">{formatLKR(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatLKR(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span>{formatLKR(totals.deliveryFee)}</span></div>
            <div className="flex justify-between text-base font-extrabold text-brand-orange pt-1"><span>Total</span><span>{formatLKR(totals.total)}</span></div>
          </div>
          <button type="submit" disabled={placing} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            {placing && <Loader2 size={18} className="animate-spin" />}
            {placing ? 'Placing Order…' : `Place Order — ${formatLKR(totals.total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
