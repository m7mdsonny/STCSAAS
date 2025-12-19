import { useState, useEffect } from 'react';
import { Globe, Save, Phone, Mail, MapPin, MessageCircle, Twitter, Linkedin, Instagram, Type, FileText, Loader2, Plus, Trash2, Eye } from 'lucide-react';
import { contentApi } from '../../lib/api';
import type { LandingSettings } from '../../types/database';

export function LandingSettingsPage() {
  const [settings, setSettings] = useState<LandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: '',
    about_title: '',
    about_description: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    whatsapp_number: '',
    show_whatsapp_button: true,
    footer_text: '',
    social_twitter: '',
    social_linkedin: '',
    social_instagram: '',
    features: [] as { title: string; description: string; icon: string }[],
    pricing: [] as { name: string; price: string; features: string[]; popular?: boolean }[],
    published: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const content = await contentApi.section('landing');
      const landingEntry = content.find((c) => c.key === 'landing');
      if (landingEntry?.value) {
        const parsed = JSON.parse(landingEntry.value) as LandingSettings;
        setSettings(parsed);
        setForm({
          hero_title: parsed.hero_title || '',
          hero_subtitle: parsed.hero_subtitle || '',
          hero_button_text: parsed.hero_button_text || '',
          about_title: parsed.about_title || '',
          about_description: parsed.about_description || '',
          contact_email: parsed.contact_email || '',
          contact_phone: parsed.contact_phone || '',
          contact_address: parsed.contact_address || '',
          whatsapp_number: parsed.whatsapp_number || '',
          show_whatsapp_button: parsed.show_whatsapp_button ?? true,
          footer_text: parsed.footer_text || '',
          social_twitter: parsed.social_twitter || '',
          social_linkedin: parsed.social_linkedin || '',
          social_instagram: parsed.social_instagram || '',
          features: parsed.features || [],
          pricing: parsed.pricing || [],
          published: parsed.published ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await contentApi.update([
        { key: 'landing', value: JSON.stringify(form), section: 'landing' },
        { key: 'landing_published', value: form.published ? 'true' : 'false', section: 'landing' },
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-stc-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">اعدادات صفحة الهبوط</h1>
          <p className="text-white/60">تخصيص محتوى الصفحة الرئيسية للمنصة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <>
              <Save className="w-5 h-5" />
              <span>تم الحفظ!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>حفظ التغييرات</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-white/5"
          />
          <span>نشر الصفحة للعامة</span>
        </label>
        <button className="btn-secondary flex items-center gap-2" onClick={() => setPreview(!preview)}>
          <Eye className="w-4 h-4" />
          {preview ? 'اخفاء المعاينة' : 'معاينة سريعة'}
        </button>
      </div>

      <div className="grid gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-stc-gold/20">
              <Globe className="w-5 h-5 text-stc-gold" />
            </div>
            <h2 className="text-lg font-semibold">القسم الرئيسي (Hero)</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">العنوان الرئيسي</label>
              <input
                type="text"
                value={form.hero_title}
                onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                className="input"
                placeholder="حول كاميراتك الى عيون ذكية"
              />
            </div>
            <div>
              <label className="label">الوصف</label>
              <textarea
                value={form.hero_subtitle}
                onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                className="input min-h-[100px] resize-none"
                placeholder="منصة تحليل الفيديو بالذكاء الاصطناعي..."
              />
            </div>
            <div>
              <label className="label">نص الزر</label>
              <input
                type="text"
                value={form.hero_button_text}
                onChange={(e) => setForm({ ...form, hero_button_text: e.target.value })}
                className="input"
                placeholder="ابدا الان"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">عن المنصة</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">عنوان القسم</label>
              <input
                type="text"
                value={form.about_title}
                onChange={(e) => setForm({ ...form, about_title: e.target.value })}
                className="input"
                placeholder="عن المنصة"
              />
            </div>
            <div>
              <label className="label">الوصف</label>
              <textarea
                value={form.about_description}
                onChange={(e) => setForm({ ...form, about_description: e.target.value })}
                className="input min-h-[100px] resize-none"
                placeholder="وصف المنصة..."
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">بطاقات المميزات / الموديولات</h2>
                <p className="text-white/60 text-sm">اضف او احذف الكروت التي تظهر في الصفحة</p>
              </div>
            </div>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => setForm({ ...form, features: [...form.features, { title: '', description: '', icon: 'Activity' }] })}
            >
              <Plus className="w-4 h-4" />
              اضافة بطاقة
            </button>
          </div>
          <div className="space-y-4">
            {form.features.map((feature, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-white/70">بطاقة #{idx + 1}</span>
                  <button className="p-2 hover:bg-red-500/20 rounded" onClick={() => setForm({ ...form, features: form.features.filter((_, i) => i !== idx) })}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => {
                      const updated = [...form.features];
                      updated[idx].title = e.target.value;
                      setForm({ ...form, features: updated });
                    }}
                    className="input"
                    placeholder="عنوان"
                  />
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => {
                      const updated = [...form.features];
                      updated[idx].icon = e.target.value;
                      setForm({ ...form, features: updated });
                    }}
                    className="input"
                    placeholder="اسم الايقونة (Flame/ScanFace...)"
                  />
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => {
                      const updated = [...form.features];
                      updated[idx].description = e.target.value;
                      setForm({ ...form, features: updated });
                    }}
                    className="input"
                    placeholder="الوصف"
                  />
                </div>
              </div>
            ))}
            {form.features.length === 0 && <p className="text-white/60 text-sm">لم تتم اضافة اي بطاقات بعد.</p>}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold">معلومات التواصل</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">البريد الالكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className="input pr-12"
                  placeholder="info@company.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="label">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="input pr-12"
                  placeholder="+966 11 000 0000"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">العنوان</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={form.contact_address}
                  onChange={(e) => setForm({ ...form, contact_address: e.target.value })}
                  className="input pr-12"
                  placeholder="الرياض، المملكة العربية السعودية"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold">زر الواتساب</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium">اظهار زر الواتساب</p>
                  <p className="text-sm text-white/50">زر عائم للتواصل السريع</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.show_whatsapp_button}
                  onChange={(e) => setForm({ ...form, show_whatsapp_button: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div>
              <label className="label">رقم الواتساب</label>
              <input
                type="tel"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="input"
                placeholder="+966500000000"
                dir="ltr"
              />
              <p className="text-xs text-white/50 mt-1">ادخل الرقم مع رمز الدولة بدون مسافات</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-stc-gold/20">
                <Type className="w-5 h-5 text-stc-gold" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">الباقات / الاسعار</h2>
                <p className="text-white/60 text-sm">تظهر هذه الباقات في قسم التسعير</p>
              </div>
            </div>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => setForm({ ...form, pricing: [...form.pricing, { name: '', price: '', features: [], popular: false }] })}
            >
              <Plus className="w-4 h-4" />
              اضافة باقة
            </button>
          </div>
          <div className="space-y-4">
            {form.pricing.map((plan, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/70">باقة #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-white/70">
                      <input
                        type="checkbox"
                        checked={plan.popular}
                        onChange={(e) => {
                          const updated = [...form.pricing];
                          updated[idx].popular = e.target.checked;
                          setForm({ ...form, pricing: updated });
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-white/5"
                      />
                      <span>مميزة</span>
                    </label>
                    <button className="p-2 hover:bg-red-500/20 rounded" onClick={() => setForm({ ...form, pricing: form.pricing.filter((_, i) => i !== idx) })}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => {
                      const updated = [...form.pricing];
                      updated[idx].name = e.target.value;
                      setForm({ ...form, pricing: updated });
                    }}
                    className="input"
                    placeholder="اسم الباقة"
                  />
                  <input
                    type="text"
                    value={plan.price}
                    onChange={(e) => {
                      const updated = [...form.pricing];
                      updated[idx].price = e.target.value;
                      setForm({ ...form, pricing: updated });
                    }}
                    className="input"
                    placeholder="السعر الشهري"
                  />
                  <input
                    type="text"
                    value={plan.features.join(', ')}
                    onChange={(e) => {
                      const updated = [...form.pricing];
                      updated[idx].features = e.target.value.split(',').map((f) => f.trim()).filter(Boolean);
                      setForm({ ...form, pricing: updated });
                    }}
                    className="input"
                    placeholder="المميزات مفصولة بفاصلة"
                  />
                </div>
              </div>
            ))}
            {form.pricing.length === 0 && <p className="text-white/60 text-sm">لم تتم اضافة باقات بعد.</p>}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Twitter className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">وسائل التواصل الاجتماعي</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </label>
              <input
                type="url"
                value={form.social_twitter}
                onChange={(e) => setForm({ ...form, social_twitter: e.target.value })}
                className="input"
                placeholder="https://twitter.com/..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </label>
              <input
                type="url"
                value={form.social_linkedin}
                onChange={(e) => setForm({ ...form, social_linkedin: e.target.value })}
                className="input"
                placeholder="https://linkedin.com/..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </label>
              <input
                type="url"
                value={form.social_instagram}
                onChange={(e) => setForm({ ...form, social_instagram: e.target.value })}
                className="input"
                placeholder="https://instagram.com/..."
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/20">
              <Type className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Footer</h2>
          </div>
          <div>
            <label className="label">نص الـ Footer</label>
            <input
              type="text"
              value={form.footer_text}
              onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
              className="input"
              placeholder="جميع الحقوق محفوظة..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
