import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { updatesApi, organizationsApi } from '../../lib/api';
import type { UpdateAnnouncement, Organization } from '../../types/database';

export function AdminUpdates() {
  const [updates, setUpdates] = useState<UpdateAnnouncement[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState<Partial<UpdateAnnouncement>>({
    title: '',
    body: '',
    organization_id: null,
    is_published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [list, orgs] = await Promise.all([updatesApi.list(), organizationsApi.getOrganizations()]);
      setUpdates(list);
      setOrganizations(orgs.data);
    } catch (error) {
      console.error('Error loading updates', error);
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async () => {
    if (!form.title || !form.title.trim()) {
      alert('يرجى إدخال عنوان التحديث');
      return;
    }
    setSaving(true);
    try {
      await updatesApi.create(form);
      setForm({ title: '', body: '', organization_id: null, is_published: false });
      await fetchAll();
    } catch (error) {
      console.error('Error creating update', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في إنشاء التحديث');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id: number) => {
    try {
      await updatesApi.toggle(id);
      await fetchAll();
    } catch (error) {
      console.error('Error toggling publish', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في تغيير حالة النشر');
    }
  };

  const removeUpdate = async (id: number) => {
    if (!confirm('حذف التحديث؟')) return;
    try {
      await updatesApi.remove(id);
      await fetchAll();
    } catch (error) {
      console.error('Error removing update', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في حذف التحديث');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">التحديثات</h1>
          <p className="text-white/60">ادارة اعلانات/تحديثات المنصة</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-stc-gold" />
          انشاء تحديث
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="العنوان"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="input"
            value={form.organization_id || ''}
            onChange={(e) => setForm({ ...form, organization_id: e.target.value || null })}
          >
            <option value="">عام</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <textarea
          className="input min-h-[120px]"
          placeholder="النص"
          value={form.body || ''}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={!!form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          نشر مباشرة
        </label>
        <button onClick={createUpdate} className="btn-primary w-fit flex items-center gap-2" disabled={saving || !form.title}>
          <Plus className="w-4 h-4" />
          <span>حفظ</span>
        </button>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold">السجل</h2>
        {loading ? (
          <p className="text-white/60">جاري التحميل...</p>
        ) : updates.length === 0 ? (
          <p className="text-white/60">لا توجد تحديثات.</p>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="p-3 bg-white/5 rounded-lg flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{update.title}</p>
                  <p className="text-xs text-white/50">{update.organization_id ? `مخصص: ${update.organization_id}` : 'عام'}</p>
                  <p className="text-sm text-white/70 mt-2 line-clamp-2">{update.body}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePublish(update.id)} className="p-2 rounded-lg hover:bg-white/10">
                    {update.is_published ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-white/50" />}
                  </button>
                  <button onClick={() => removeUpdate(update.id)} className="p-2 rounded-lg hover:bg-white/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
