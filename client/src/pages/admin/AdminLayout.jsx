import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Tags, ClipboardList, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/foods', icon: UtensilsCrossed, label: 'Food Items' },
  { to: '/admin/categories', icon: Tags, label: 'Categories' },
  { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' }
];

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const cls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-brand-orange text-white' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal">Admin Panel</h1>
          <p className="text-sm text-gray-500">Signed in as {user?.name}</p>
        </div>
        <NavLink to="/" className="btn-outline !py-2 text-sm flex items-center gap-1"><ArrowLeft size={16} /> View Site</NavLink>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="card p-3 h-fit lg:sticky lg:top-24">
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end} className={cls}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
