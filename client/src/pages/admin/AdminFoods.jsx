import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import { foodApi, categoryApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatLKR, FoodImage } from '../../components/FoodCard.jsx';

const emptyForm = { food_name: '', description: '', price: '', image: '', category_id: '', availability: true };

export default function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | food object
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    foodApi.list().then(setFoods).catch(() => {});
    categoryApi.list().then(setCategories).catch(() => {});
  };
  useEffect(load, []);

  const openNew = () => { setEditing('new'); setForm({ ...emptyForm, category_id: categories[0]?.category_id || '' }); };
  const openEdit = (f) => {
    setEditing(f);
    setForm({ food_name: f.food_name, description: f.description, price: f.price, image: f.image || '', category_id: f.category_id, availability: !!f.availability });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), category_id: Number(form.category_id), availability: form.availability ? 1 : 0 };
      if (editing === 'new') await foodApi.create(payload);
      else await foodApi.update(editing.food_id, payload);
      toast.success('Food item saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (f) => {
    if (!window.confirm(`Delete "${f.food_name}"?`)) return;
    try {
      await foodApi.remove(f.food_id);
      toast.success('Food item deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-brand-charcoal">Food Items ({foods.length})</h2>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Food</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <tr><th className="px-4 py-3">Food</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {foods.map((f) => (
              <tr key={f.food_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FoodImage src={f.image} alt={f.food_name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium">{f.food_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{f.category_name}</td>
                <td className="px-4 py-3 font-semibold">{formatLKR(f.price)}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${f.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {f.availability ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                  <button onClick={() => remove(f)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing === 'new' ? 'Add Food Item' : 'Edit Food Item'}</h3>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Food Name *</label>
                <input required className="input mt-1" value={form.food_name} onChange={set('food_name')} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <textarea className="input mt-1" rows="2" value={form.description} onChange={set('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Price (LKR) *</label>
                  <input required type="number" min="0" step="0.01" className="input mt-1" value={form.price} onChange={set('price')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category *</label>
                  <select required className="input mt-1" value={form.category_id} onChange={set('category_id')}>
                    {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Image URL</label>
                <input className="input mt-1" value={form.image} onChange={set('image')} placeholder="https://…" />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.availability} onChange={set('availability')} className="accent-brand-orange w-4 h-4" />
                Available for ordering
              </label>
              <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />} Save
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
