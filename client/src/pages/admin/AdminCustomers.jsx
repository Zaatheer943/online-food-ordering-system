import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import { adminApi } from '../../services/api.js';
import { formatLKR } from '../../components/FoodCard.jsx';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => { adminApi.customers().then(setCustomers).catch(() => {}); }, []);

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold text-brand-charcoal mb-6">Customers ({customers.length})</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Address</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Total Spent</th><th className="px-5 py-3">Joined</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c) => (
              <tr key={c.user_id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-gray-500">{c.email}</td>
                <td className="px-5 py-3 text-gray-500">{c.phone || '—'}</td>
                <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{c.address || '—'}</td>
                <td className="px-5 py-3">{c.order_count}</td>
                <td className="px-5 py-3 font-semibold">{formatLKR(c.total_spent)}</td>
                <td className="px-5 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan="7" className="px-5 py-6 text-center text-gray-400">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
