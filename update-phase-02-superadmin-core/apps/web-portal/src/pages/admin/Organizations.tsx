import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Building2, Edit2, Pause, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { organizationsApi, subscriptionPlansApi, smsQuotaApi } from '../../lib/api';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import type { Organization, SubscriptionPlan, SMSQuota } from '../../types/database';

interface OrganizationForm {
  name: string;
  name_en: string;
  email: string;
  phone: string;
  city: string;
  subscription_plan: SubscriptionPlan['name'];
  max_cameras: number;
  max_edge_servers: number;
  address?: string;
  tax_number?: string;
}

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [settingsOrg, setSettingsOrg] = useState<Organization | null>(null);
  const [quota, setQuota] = useState<SMSQuota | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [formData, setFormData] = useState<OrganizationForm>({
    name: '',
    name_en: '',
    email: '',
    phone: '',
    city: '',
    subscription_plan: 'basic',
    max_cameras: 4,
    max_edge_servers: 1,
    address: '',
    tax_number: '',
  });
  const [settingsData, setSettingsData] = useState<OrganizationForm>({
    name: '',
    name_en: '',
    email: '',
    phone: '',
    city: '',
    subscription_plan: 'basic',
    max_cameras: 4,
    max_edge_servers: 1,
    address: '',
    tax_number: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => fetchOrganizations(), 250);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await organizationsApi.getOrganizations({ per_page: 100, search });
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await subscriptionPlansApi.list();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const applyPlanDefaults = (planName: string) => {
    const plan = plans.find((p) => p.name === planName);
    if (plan) {
      setFormData((prev) => ({
        ...prev,
        subscription_plan: plan.name as any,
        max_cameras: plan.max_cameras,
        max_edge_servers: plan.max_edge_servers,
      }));
    }
  };

  const applySettingsPlanDefaults = (planName: string) => {
    const plan = plans.find((p) => p.name === planName);
    if (plan) {
      setSettingsData((prev) => ({
        ...prev,
        subscription_plan: plan.name as any,
        max_cameras: plan.max_cameras,
        max_edge_servers: plan.max_edge_servers,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingOrg) {
        await organizationsApi.updateOrganization(editingOrg.id, formData);
        setEditingOrg(null);
      } else {
        await organizationsApi.createOrganization(formData);
      }
      fetchOrganizations();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving organization:', error);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      name_en: org.name_en || '',
      email: org.email || '',
      phone: org.phone || '',
      city: org.city || '',
      subscription_plan: org.subscription_plan,
      max_cameras: org.max_cameras,
      max_edge_servers: org.max_edge_servers,
      address: org.address || '',
      tax_number: org.tax_number || '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (org: Organization) => {
    try {
      await organizationsApi.toggleActive(org.id);
      fetchOrganizations();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const openSettings = async (org: Organization) => {
    setSettingsOrg(org);
    setSettingsData({
      name: org.name,
      name_en: org.name_en || '',
      email: org.email || '',
      phone: org.phone || '',
      city: org.city || '',
      subscription_plan: org.subscription_plan,
      max_cameras: org.max_cameras,
      max_edge_servers: org.max_edge_servers,
      address: org.address || '',
      tax_number: org.tax_number || '',
    });

    try {
      const quotaData = await smsQuotaApi.get(org.id);
      setQuota(quotaData);
    } catch (error) {
      console.error('Failed to load SMS quota', error);
      setQuota(null);
    }

    setShowSettings(true);
  };

  const saveSettings = async () => {
    if (!settingsOrg) return;
    setSavingSettings(true);
    try {
      await organizationsApi.updateOrganization(settingsOrg.id, {
        name: settingsData.name,
        name_en: settingsData.name_en,
        email: settingsData.email,
        phone: settingsData.phone,
        city: settingsData.city,
        address: settingsData.address,
        tax_number: settingsData.tax_number,
      });

      await organizationsApi.updatePlan(settingsOrg.id, settingsData.subscription_plan);
      await organizationsApi.updateOrganization(settingsOrg.id, {
        max_cameras: settingsData.max_cameras,
        max_edge_servers: settingsData.max_edge_servers,
      });

      if (quota) {
        await smsQuotaApi.update(settingsOrg.id, {
          monthly_limit: quota.monthly_limit,
          used_this_month: quota.used_this_month,
          resets_at: quota.resets_at || undefined,
        });
      }

      await fetchOrganizations();
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings', error);
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredOrgs = useMemo(() => {
    if (!search.trim()) return organizations;
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      (org.email || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [organizations, search]);

  const quotaUsage = quota && quota.monthly_limit > 0
    ? Math.min(100, Math.round((quota.used_this_month / quota.monthly_limit) * 100))
    : 0;

  const columns = [
    {
      key: 'name',
      title: 'المؤسسة',
      render: (org: Organization) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-stc-gold/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-stc-gold" />
          </div>
          <div>
            <p className="font-medium">{org.name}</p>
            <p className="text-xs text-white/50">{org.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subscription_plan',
      title: 'الباقة',
      render: (org: Organization) => (
        <span className={`badge ${
          org.subscription_plan === 'enterprise' ? 'badge-success' :
          org.subscription_plan === 'professional' ? 'badge-warning' : 'badge-info'
        }`}>
          {org.subscription_plan === 'enterprise' ? 'مؤسسي' :
           org.subscription_plan === 'professional' ? 'احترافي' : 'اساسي'}
        </span>
      ),
    },
    {
      key: 'limits',
      title: 'الحدود',
      render: (org: Organization) => (
        <div className="text-sm">
          <p>{org.max_cameras} كاميرا</p>
          <p className="text-white/50">{org.max_edge_servers} سيرفر</p>
        </div>
      ),
    },
    {
      key: 'is_active',
      title: 'الحالة',
      render: (org: Organization) => (
        <span className={`badge ${org.is_active ? 'badge-success' : 'badge-danger'}`}>
          {org.is_active ? 'نشط' : 'معلق'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'تاريخ الانشاء',
      render: (org: Organization) => (
        <span className="text-white/60">
          {new Date(org.created_at).toLocaleDateString('ar-EG')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (org: Organization) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openSettings(org)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="اعدادات"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(org)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="تعديل"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(org)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={org.is_active ? 'تعليق' : 'تفعيل'}
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المؤسسات</h1>
          <p className="text-white/60">ادارة المؤسسات والاشتراكات وضبط الحصص</p>
        </div>
        <button
          onClick={() => {
            setEditingOrg(null);
            setFormData({
              name: '',
              name_en: '',
              email: '',
              phone: '',
              city: '',
              subscription_plan: plans[0]?.name || 'basic',
              max_cameras: plans[0]?.max_cameras || 4,
              max_edge_servers: plans[0]?.max_edge_servers || 1,
              address: '',
              tax_number: '',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>اضافة مؤسسة</span>
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن مؤسسة..."
            className="input pr-12"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrgs}
        loading={loading}
        emptyMessage="لا توجد مؤسسات"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingOrg ? 'تعديل المؤسسة' : 'اضافة مؤسسة جديدة'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">اسم المؤسسة (عربي)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">اسم المؤسسة (انجليزي)</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">البريد الالكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">المدينة</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">الباقة</label>
              <select
                value={formData.subscription_plan}
                onChange={(e) => {
                  setFormData({ ...formData, subscription_plan: e.target.value as any });
                  applyPlanDefaults(e.target.value);
                }}
                className="select"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.name}>{plan.name_ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الحد الاقصى للكاميرات</label>
              <input
                type="number"
                value={formData.max_cameras}
                onChange={(e) => setFormData({ ...formData, max_cameras: parseInt(e.target.value) })}
                className="input"
                min="1"
                max="128"
              />
            </div>
            <div>
              <label className="label">الحد الاقصى للسيرفرات</label>
              <input
                type="number"
                value={formData.max_edge_servers}
                onChange={(e) => setFormData({ ...formData, max_edge_servers: parseInt(e.target.value) })}
                className="input"
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              الغاء
            </button>
            <button type="submit" className="btn-primary">
              {editingOrg ? 'حفظ التعديلات' : 'اضافة المؤسسة'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="اعدادات المؤسسة"
        size="lg"
      >
        {!settingsOrg ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-stc-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">اسم المؤسسة</label>
                <input
                  type="text"
                  value={settingsData.name}
                  onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">البريد الالكتروني</label>
                <input
                  type="email"
                  value={settingsData.email}
                  onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">الباقة</label>
                <select
                  value={settingsData.subscription_plan}
                  onChange={(e) => {
                    setSettingsData({ ...settingsData, subscription_plan: e.target.value as any });
                    applySettingsPlanDefaults(e.target.value);
                  }}
                  className="select"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.name}>{plan.name_ar}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">الكاميرات</label>
                  <input
                    type="number"
                    value={settingsData.max_cameras}
                    onChange={(e) => setSettingsData({ ...settingsData, max_cameras: parseInt(e.target.value) })}
                    className="input"
                    min={1}
                  />
                </div>
                <div>
                  <label className="label">السيرفرات</label>
                  <input
                    type="number"
                    value={settingsData.max_edge_servers}
                    onChange={(e) => setSettingsData({ ...settingsData, max_edge_servers: parseInt(e.target.value) })}
                    className="input"
                    min={1}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">حصة الرسائل</p>
                  <p className="text-sm text-white/60">تتبع الاستخدام المتبقي</p>
                </div>
                <span className={`badge ${quotaUsage >= 100 ? 'badge-danger' : quotaUsage > 80 ? 'badge-warning' : 'badge-info'}`}>
                  {quotaUsage}% مستخدم
                </span>
              </div>
              {quota ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">الحد الشهري</label>
                      <input
                        type="number"
                        value={quota.monthly_limit}
                        onChange={(e) => setQuota({ ...quota, monthly_limit: parseInt(e.target.value) })}
                        className="input"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="label">المستخدم</label>
                      <input
                        type="number"
                        value={quota.used_this_month}
                        onChange={(e) => setQuota({ ...quota, used_this_month: parseInt(e.target.value) })}
                        className="input"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="label">تجديد الحصة</label>
                      <input
                        type="date"
                        value={quota.resets_at ? quota.resets_at.slice(0, 10) : ''}
                        onChange={(e) => setQuota({ ...quota, resets_at: e.target.value ? `${e.target.value}T00:00:00Z` : null })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${quotaUsage >= 100 ? 'bg-red-500' : quotaUsage > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${quotaUsage}%` }}
                    />
                  </div>
                  {quotaUsage >= 100 && (
                    <p className="text-sm text-red-400">تم استهلاك الحصة بالكامل. لن يتم ارسال تنبيهات SMS جديدة.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-white/60">لا توجد حصة SMS مسجلة لهذه المؤسسة بعد.</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="btn-secondary">اغلاق</button>
              <button onClick={saveSettings} className="btn-primary" disabled={savingSettings}>
                {savingSettings ? 'جاري الحفظ...' : 'حفظ الاعدادات'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
