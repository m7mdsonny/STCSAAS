import { useState, useEffect } from 'react';
import { Building2, Save, MapPin, Phone, Mail, FileText, Calendar, CreditCard, Camera, Server } from 'lucide-react';
import { organizationsApi } from '../../lib/api/organizations';
import { settingsApi } from '../../lib/api/settings';
import { useAuth } from '../../contexts/AuthContext';
import type { SubscriptionPlan } from '../../types/database';

export function OrganizationSettings() {
  const { organization, canManage } = useAuth();
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [stats, setStats] = useState({ cameras: 0, servers: 0, users: 0 });

  const [form, setForm] = useState({
    name: '',
    name_en: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    tax_number: '',
  });

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name,
        name_en: organization.name_en || '',
        address: organization.address || '',
        city: organization.city || '',
        phone: organization.phone || '',
        email: organization.email || '',
        tax_number: organization.tax_number || '',
      });
      fetchPlanAndStats();
    }
  }, [organization]);

  const fetchPlanAndStats = async () => {
    if (!organization) return;

    try {
      const [plans, orgStats] = await Promise.all([
        settingsApi.getPlans(),
        organizationsApi.getStats(organization.id),
      ]);

      const planName = organization.subscription_plan === 'basic' ? 'Basic' :
                      organization.subscription_plan === 'professional' ? 'Professional' : 'Enterprise';
      const matchedPlan = plans.find(p => p.name === planName);
      if (matchedPlan) setPlan(matchedPlan);

      setStats({
        cameras: orgStats.cameras_count || 0,
        servers: orgStats.edge_servers_count || 0,
        users: orgStats.users_count || 0,
      });
    } catch (error) {
      console.error('Error fetching plan and stats:', error);
    }
  };

  const saveSettings = async () => {
    if (!organization || !canManage) return;
    setSaving(true);

    try {
      await organizationsApi.updateOrganization(organization.id, form);
    } catch (error) {
      console.error('Error saving organization settings:', error);
    }

    setSaving(false);
  };

  const getPlanColor = () => {
    switch (organization?.subscription_plan) {
      case 'enterprise': return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 'professional': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className={`card p-6 ${getPlanColor()}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">الباقة: {plan?.name_ar || organization?.subscription_plan}</h3>
            <p className="text-white/80 text-sm mt-1">
              {plan?.price_monthly?.toLocaleString()} جنيه / شهريا
            </p>
          </div>
          <CreditCard className="w-10 h-10 text-white/80" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Camera className="w-5 h-5 mx-auto mb-1 text-white/80" />
            <p className="text-xl font-bold text-white">{stats.cameras} / {organization?.max_cameras}</p>
            <p className="text-xs text-white/60">كاميرات</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Server className="w-5 h-5 mx-auto mb-1 text-white/80" />
            <p className="text-xl font-bold text-white">{stats.servers} / {organization?.max_edge_servers}</p>
            <p className="text-xs text-white/60">سيرفرات</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Building2 className="w-5 h-5 mx-auto mb-1 text-white/80" />
            <p className="text-xl font-bold text-white">{stats.users}</p>
            <p className="text-xs text-white/60">مستخدمين</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-stc-gold" />
          معلومات المؤسسة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">اسم المؤسسة (عربي)</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              disabled={!canManage}
            />
          </div>
          <div>
            <label className="label">اسم المؤسسة (انجليزي)</label>
            <input
              type="text"
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              className="input"
              dir="ltr"
              disabled={!canManage}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-stc-gold" />
          معلومات الاتصال
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد الالكتروني
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              dir="ltr"
              placeholder="info@company.com"
              disabled={!canManage}
            />
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              dir="ltr"
              placeholder="+966 5x xxx xxxx"
              disabled={!canManage}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-stc-gold" />
          العنوان
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">المدينة</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="input"
              disabled={!canManage}
            >
              <option value="">اختر المدينة</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
              <option value="الدمام">الدمام</option>
              <option value="الخبر">الخبر</option>
              <option value="الظهران">الظهران</option>
              <option value="تبوك">تبوك</option>
              <option value="ابها">ابها</option>
              <option value="الطائف">الطائف</option>
              <option value="نجران">نجران</option>
              <option value="جازان">جازان</option>
              <option value="ينبع">ينبع</option>
              <option value="القطيف">القطيف</option>
              <option value="حائل">حائل</option>
              <option value="بريدة">بريدة</option>
            </select>
          </div>
          <div>
            <label className="label">العنوان التفصيلي</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input"
              placeholder="الحي، الشارع، رقم المبنى"
              disabled={!canManage}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-stc-gold" />
          المعلومات الضريبية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">الرقم الضريبي</label>
            <input
              type="text"
              value={form.tax_number}
              onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
              className="input"
              dir="ltr"
              placeholder="300xxxxxxxxx"
              disabled={!canManage}
            />
          </div>
          <div>
            <label className="label">تاريخ الاشتراك</label>
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
              <Calendar className="w-5 h-5 text-white/40" />
              <span className="text-white/70">
                {organization?.created_at ? new Date(organization.created_at).toLocaleDateString('ar-SA') : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {canManage && (
        <div className="flex justify-end">
          <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
