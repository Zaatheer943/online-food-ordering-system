import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { orderApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatLKR } from '../components/FoodCard.jsx';

const statusColor = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Confirmed': 'bg-blue-100 text-blue-800',
  'Preparing': 'bg-purple-100 text-purple-800',
  'Out for Delivery': 'bg-orange-100 text-orange-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

export function StatusBadge({ status }) {
  return <span className={`badge ${statusColor[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.myOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.order_status));
  const delivered = orders.filter((o) => o.order_status === 'Delivered').length;
  const totalSpent = orders.filter((o) => o.order_status !== 'Cancelled').reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-charcoal">Hi, {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your orders.</p>
        </div>
        <Link to="/menu" className="btn-primary flex items-center gap-2"><ShoppingBag size={18} /> Order Food</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { icon: Package, label: 'Total Orders', value: orders.length, color: 'text-brand-orange' },
          { icon: Clock, label: 'Active Orders', value: active.length, color: 'text-yellow-600' },
          { icon: CheckCircle2, label: 'Delivered', value: delivered, color: 'text-green-600' },
          { icon: ShoppingBag, label: 'Total Spent', value: formatLKR(totalSpent), color: 'text-purple-600' }
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <Icon size={22} className={color} />
            <p className="text-2xl font-extrabold text-brand-charcoal mt-2">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-lg">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-brand-orange font-semibold hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
        </div>
        {loading ? (
          <p className="p-5 text-gray-400 text-sm">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-5 text-gray-400 text-sm">No orders yet. <Link to="/menu" className="text-brand-orange">Order something delicious!</Link></p>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map((o) => (
              <Link key={o.order_id} to={`/orders/${o.order_id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div>
                  <p className="font-semibold text-sm">Order #{o.order_id}</p>
                  <p className="text-xs text-gray-400">{o.item_count} item(s) • {new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{formatLKR(o.total_amount)}</span>
                  <StatusBadge status={o.order_status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
