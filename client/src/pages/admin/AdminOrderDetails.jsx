import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import { orderApi } from '../../services/api.js';
import { formatLKR, FoodImage } from '../../components/FoodCard.jsx';
import { StatusBadge } from '../Dashboard.jsx';

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => orderApi.get(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const setStatus = async (status) => {
    await orderApi.updateStatus(id, status);
    load();
  };

  if (loading) return <AdminLayout><p className="text-gray-400">Loading…</p></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-gray-400">Order not found.</p></AdminLayout>;

  return (
    <AdminLayout>
      <Link to="/admin/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-orange mb-4">
        <ArrowLeft size={16} /> All Orders
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-brand-charcoal">Order #{order.order_id}</h2>
            <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.order_status} />
            <select className="input !w-auto !py-2" value={order.order_status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 card p-6">
          <h3 className="font-bold mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((i) => (
              <div key={i.order_item_id} className="flex items-center gap-3">
                <FoodImage src={i.image} alt={i.food_name} className="w-12 h-12 rounded-lg object-cover" />
                <span className="flex-1 text-sm font-medium">{i.food_name} × {i.quantity}</span>
                <span className="text-sm text-gray-500">@ {formatLKR(i.unit_price)}</span>
                <span className="text-sm font-semibold w-20 text-right">{formatLKR(i.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatLKR(order.items.reduce((s, i) => s + i.subtotal, 0))}</span></div>
            <div className="flex justify-between font-extrabold text-brand-orange text-base"><span>Total</span><span>{formatLKR(order.total_amount)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><MapPin size={16} className="text-brand-orange" /> Customer</h3>
            <p className="text-sm font-medium">{order.customer_name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><Mail size={14} /> {order.customer_email}</p>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><Phone size={14} /> {order.contact_phone || order.customer_phone || '—'}</p>
            <p className="text-sm text-gray-500 mt-2">{order.delivery_address}</p>
            {order.customer_address && order.customer_address !== order.delivery_address && (
              <p className="text-xs text-gray-400 mt-1">Profile address: {order.customer_address}</p>
            )}
          </div>
          <div className="card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><CreditCard size={16} className="text-brand-orange" /> Payment</h3>
            <p className="text-sm">{order.payment_method}</p>
            <p className="text-xs text-gray-400 mt-1">Status: {order.payment_status}</p>
            {order.transaction_ref && <p className="text-xs text-gray-400">Ref: {order.transaction_ref}</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
