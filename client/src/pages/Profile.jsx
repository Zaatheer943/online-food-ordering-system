import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { profileApi } from '../services/api.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', phone: '', address: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '', password: '' });
  }, [user]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address };
      if (form.password) payload.password = form.password;
      const updated = await profileApi.update(payload);
      setUser(updated);
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-charcoal">My Profile</h1>
      <div className="card p-6 mt-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-brand-orange text-white flex items-center justify-center text-xl font-extrabold">
            {(user?.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-brand-charcoal">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge bg-brand-orange/10 text-brand-orange mt-1 capitalize">{user?.role}</span>
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Full Name</label>
            <input className="input mt-1" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email (cannot change)</label>
            <input className="input mt-1 bg-gray-50" value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Phone</label>
            <input className="input mt-1" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Delivery Address</label>
            <textarea className="input mt-1" rows="2" value={form.address} onChange={set('address')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">New Password (leave blank to keep)</label>
            <input type="password" className="input mt-1" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}
