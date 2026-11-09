import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import { categoryApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category_name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => categoryApi.list().then(setCategories).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing('new'); setForm({ category_name: '', description: '' }); };
  const openEdit = (c) => { setEditing(c); setForm({ category_name: c.category_name, description: c.description || '' }); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') await categoryApi.create(form);
      else await categoryApi.update(editing.category_id, form);
      toast.success('Category saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.category_name}"?`)) return;
    try {
      await categoryApi.remove(c.category_id);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-brand-charcoal">Categories ({categories.length})</h2>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Category</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.category_id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-brand-charcoal">{c.category_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{c.description || '—'}</p>
              </div>
              <span className="badge bg-brand-orange/10 text-brand-orange">{c.item_count} items</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(c)} className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1"><Pencil size={14} /> Edit</button>
              <button onClick={() => remove(c)} className="btn-outline !py-1.5 !px-3 text-xs !text-red-600 !border-red-200 hover:!border-red-400 flex items-center gap-1"><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing === 'new' ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Category Name *</label>
                <input required className="input mt-1" value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <textarea className="input mt-1" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
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
