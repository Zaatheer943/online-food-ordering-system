import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold text-brand-charcoal text-center">Create Account</h1>
        <p className="text-center text-gray-500 text-sm mt-1">Join FoodDash and start ordering</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Full Name *</label>
            <input required className="input mt-1" value={form.name} onChange={set('name')} placeholder="John Doe" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email *</label>
            <input type="email" required className="input mt-1" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <input className="input mt-1" value={form.phone} onChange={set('phone')} placeholder="07X XXX XXXX" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <input className="input mt-1" value={form.address} onChange={set('address')} placeholder="Colombo" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Password * (min 6 chars)</label>
            <input type="password" required minLength={6} className="input mt-1" value={form.password} onChange={set('password')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Confirm Password *</label>
            <input type="password" required className="input mt-1" value={form.confirm} onChange={set('confirm')} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Have an account? <Link to="/login" className="text-brand-orange font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
