import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, UtensilsCrossed, Banknote, ArrowRight } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import { adminApi } from '../../services/api.js';
import { formatLKR } from '../../components/FoodCard.jsx';
import { StatusBadge } from '../Dashboard.jsx';

const statusColors = {
  Pending: 'bg-yellow-400', Confirmed: 'bg-blue-500', Preparing: 'bg-purple-500',
  'Out for Delivery': 'bg-orange-500', Delivered: 'bg-green-500', Cancelled: 'bg-red-500'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    adminApi.stats().then(setStats).catch(() => {});
    adminApi.customers().then(setCustomers).catch(() => {});
  }, []);

  if (!stats) return <AdminLayout><p className="text-gray-400">Loading…</p></AdminLayout>;

  const totalStatus = stats.byStatus.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <AdminLayout>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'text-brand-orange' },
          { icon: Users, label: 'Customers', value: stats.totalCustomers, color: 'text-blue-600' },
          { icon: UtensilsCrossed, label: 'Food Items', value: stats.totalFoods, color: 'text-green-600' },
          { icon: Banknote, label: 'Revenue', value: formatLKR(stats.totalRevenue), color: 'text-purple-600' }
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <Icon size={22} className={color} />
            <p className="text-2xl font-extrabold text-brand-charcoal mt-2">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Order statistics */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Order Statistics</h2>
          <div className="space-y-3">
            {stats.byStatus.length === 0 && <p className="text-sm text-gray-400">No orders yet.</p>}
            {stats.byStatus.map((s) => (
              <div key={s.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.status}</span><span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${statusColors[s.status] || 'bg-gray-400'}`} style={{ width: `${(s.count / totalStatus) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-brand-orange font-semibold hover:underline flex items-center gap-1">All <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.map((o) => (
              <Link key={o.order_id} to={`/admin/orders/${o.order_id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                <div>
                  <p className="text-sm font-semibold">#{o.order_id} — {o.customer_name}</p>
                  <p className="text-xs text-gray-400">{formatLKR(o.total_amount)}</p>
                </div>
                <StatusBadge status={o.order_status} />
              </Link>
            ))}
            {stats.recentOrders.length === 0 && <p className="text-sm text-gray-400">No orders yet.</p>}
          </div>
        </div>
      </div>

      {/* Customers preview */}
      <div className="card mt-6">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold">Customers</h2>
          <NavLinkCustomers />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Total Spent</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.slice(0, 6).map((c) => (
                <tr key={c.user_id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-gray-500">{c.email}</td>
                  <td className="px-5 py-3 text-gray-500">{c.phone || '—'}</td>
                  <td className="px-5 py-3">{c.order_count}</td>
                  <td className="px-5 py-3 font-semibold">{formatLKR(c.total_spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function NavLinkCustomers() {
  return <Link to="/admin/customers" className="text-sm text-brand-orange font-semibold hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>;
}
