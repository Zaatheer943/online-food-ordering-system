import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api.js';
import { formatLKR, FoodImage } from '../components/FoodCard.jsx';
import { StatusBadge } from './Dashboard.jsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.myOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-charcoal">Order History</h1>
      {loading ? (
        <p className="text-gray-400 mt-8">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="card p-10 mt-8 text-center text-gray-400">
          <p className="font-semibold">No orders yet</p>
          <Link to="/menu" className="btn-primary inline-block mt-4">Browse Menu</Link>
        </div>
      ) : (
        <div className="space-y-4 mt-8">
          {orders.map((o) => (
            <Link key={o.order_id} to={`/orders/${o.order_id}`} className="card p-5 flex flex-wrap items-center justify-between gap-4 hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-bold text-brand-charcoal">Order #{o.order_id}</p>
                  <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString()} • {o.item_count} item(s)</p>
                </div>
              </div>
              <StatusBadge status={o.order_status} />
              <span className="font-extrabold text-brand-orange">{formatLKR(o.total_amount)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
