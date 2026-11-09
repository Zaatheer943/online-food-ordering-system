import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totals } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'text-brand-orange' : 'text-gray-600 hover:text-brand-orange'}`;

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-brand-orange text-white flex items-center justify-center font-extrabold text-lg">F</span>
          <span className="text-xl font-extrabold text-brand-charcoal">Food<span className="text-brand-orange">Dash</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/menu" className={linkCls}>Menu</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-700">
            <ShoppingCart size={22} />
            {totals.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totals.count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-brand-orange px-3 py-2">
                <User size={18} /> {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-outline !py-2 !px-4 text-sm">Login</Link>
              <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Sign Up</Link>
            </div>
          )}

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <NavLink to="/" end onClick={() => setOpen(false)} className={linkCls}>Home</NavLink>
          <NavLink to="/menu" onClick={() => setOpen(false)} className={linkCls}>Menu</NavLink>
          {user ? (
            <>
              <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className={linkCls}>
                <LayoutDashboard size={16} className="inline mr-1" /> Dashboard
              </NavLink>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)} className={linkCls}>Login</NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)} className={linkCls}>Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
