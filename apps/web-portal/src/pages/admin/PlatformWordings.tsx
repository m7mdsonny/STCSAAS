import { useEffect, useState } from 'react';
import { Type, Plus, Trash2, Save, Search, Tag, Globe } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface PlatformWording {
  id: number;
  key: string;
  label: string | null;
  value_ar: string | null;
  value_en: string | null;
  category: string;
  context: string | null;
  description: string | null;
  is_customizable: boolean;
}

export function PlatformWordings() {
  const [wordings, setWordings] = useState<PlatformWording[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<PlatformWording>>({});

  useEffect(() => {
    fetchWordings();
  }, [category]);

  const fetchWordings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await apiClient.get('/api/v1/wordings', { params });
      setWordings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching wordings:', error);
      setWordings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: number) => {
    try {
      await apiClient.put(`/api/v1/wordings/${id}`, form);
      setEditing(null);
      setForm({});
      await fetchWordings();
      alert('تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Error saving wording:', error);
      alert('حدث خطأ في حفظ التغييرات');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا النص؟')) return;
    try {
      await apiClient.delete(`/api/v1/wordings/${id}`);
      await fetchWordings();
      alert('تم الحذف بنجاح');
    } catch (error) {
      console.error('Error deleting wording:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  const categories = Array.from(new Set(wordings.map(w => w.category)));

  const filteredWordings = wordings.filter(w => {
    if (search && !w.key.toLowerCase().includes(search.toLowerCase()) &&
        !w.label?.toLowerCase().includes(search.toLowerCase()) &&
        !w.value_ar?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Type className="w-6 h-6 text-stc-gold" />
            إدارة نصوص المنصة
          </h1>
          <p className="text-white/60">تعديل وإدارة جميع النصوص والعناوين في المنصة</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="بحث في النصوص..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pr-10"
            />
          </div>
          <select
            className="input w-48"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">جميع الفئات</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-white/60 text-center py-8">جاري التحميل...</p>
        ) : filteredWordings.length === 0 ? (
          <p className="text-white/60 text-center py-8">لا توجد نصوص.</p>
        ) : (
          <div className="space-y-3">
            {filteredWordings.map((wording) => (
              <div
                key={wording.id}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                {editing === wording.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-stc-gold" />
                        <span className="font-mono text-sm text-white/60">{wording.key}</span>
                        {wording.category && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {wording.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(wording.id)}
                          className="btn-primary text-sm flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          حفظ
                        </button>
                        <button
                          onClick={() => {
                            setEditing(null);
                            setForm({});
                          }}
                          className="btn-secondary text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">العنوان (Label)</label>
                      <input
                        type="text"
                        className="input"
                        value={form.label || wording.label || ''}
                        onChange={(e) => setForm({ ...form, label: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        النص بالعربية
                      </label>
                      <textarea
                        className="input min-h-[80px]"
                        value={form.value_ar !== undefined ? form.value_ar : (wording.value_ar || '')}
                        onChange={(e) => setForm({ ...form, value_ar: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        النص بالإنجليزية
                      </label>
                      <textarea
                        className="input min-h-[80px]"
                        value={form.value_en !== undefined ? form.value_en : (wording.value_en || '')}
                        onChange={(e) => setForm({ ...form, value_en: e.target.value })}
                      />
                    </div>
                    {wording.description && (
                      <p className="text-xs text-white/50">{wording.description}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{wording.label || wording.key}</span>
                        <span className="font-mono text-xs text-white/40">{wording.key}</span>
                        {wording.category && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {wording.category}
                          </span>
                        )}
                        {!wording.is_customizable && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                            غير قابل للتخصيص
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-white/50">عربي:</span>
                          <p className="text-white/80">{wording.value_ar || '-'}</p>
                        </div>
                        <div>
                          <span className="text-white/50">English:</span>
                          <p className="text-white/80">{wording.value_en || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(wording.id);
                          setForm({
                            label: wording.label,
                            value_ar: wording.value_ar,
                            value_en: wording.value_en,
                          });
                        }}
                        className="btn-secondary text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(wording.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

