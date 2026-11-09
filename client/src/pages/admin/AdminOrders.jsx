import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatLKR } from '../../components/FoodCard.jsx';
import { StatusBadge } from '../Dashboard.jsx';

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    orderApi.all(filter || undefined).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const changeStatus = async (order, status) => {
    try {
      await orderApi.updateStatus(order.order_id, status);
      toast.success(`Order #${order.order_id} → ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-brand-charcoal">All Orders ({orders.length})</h2>
        <select className="input !w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th><th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>}
            {!loading && orders.length === 0 && <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">No orders found.</td></tr>}
            {orders.map((o) => (
              <tr key={o.order_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${o.order_id}`} className="font-semibold text-brand-orange hover:underline">#{o.order_id}</Link>
                  <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-xs text-gray-400">{o.customer_email}</p>
                </td>
                <td className="px-4 py-3">{o.item_count}</td>
                <td className="px-4 py-3 font-semibold">{formatLKR(o.total_amount)}</td>
                <td className="px-4 py-3 text-gray-500">{o.payment_method || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={o.order_status} /></td>
                <td className="px-4 py-3">
                  <select
                    className="input !py-1.5 !px-2 !w-auto text-xs"
                    value={o.order_status}
                    onChange={(e) => changeStatus(o, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
