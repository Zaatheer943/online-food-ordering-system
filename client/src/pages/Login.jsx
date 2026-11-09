import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold text-brand-charcoal text-center">Welcome Back</h1>
        <p className="text-center text-gray-500 text-sm mt-1">Login to your FoodDash account</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input type="email" required className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input type="password" required className="input mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link to="/register" className="text-brand-orange font-semibold hover:underline">Sign up</Link>
        </p>
        <div className="mt-6 p-3 bg-brand-cream rounded-xl text-xs text-gray-500">
          <strong>Demo admin:</strong> admin@foodorder.com / admin123
        </div>
      </div>
    </div>
  );
}
