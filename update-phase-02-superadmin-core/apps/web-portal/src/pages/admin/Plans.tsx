import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Edit2, Check, X, Plus, ToggleLeft, ToggleRight, BadgeCheck } from 'lucide-react';
import { subscriptionPlansApi } from '../../lib/api';
import type { SubscriptionPlan } from '../../types/database';
import { AI_MODULES } from '../../types/database';
import { Modal } from '../../components/ui/Modal';

interface PlanForm {
  name: string;
  name_ar: string;
  price_monthly: number;
  price_yearly: number;
  max_cameras: number;
  max_edge_servers: number;
  available_modules: string[];
  sms_quota_monthly: number;
  is_active: boolean;
}

export function Plans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PlanForm>({
    name: '',
    name_ar: '',
    price_monthly: 0,
    price_yearly: 0,
    max_cameras: 4,
    max_edge_servers: 1,
    available_modules: [],
    sms_quota_monthly: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await subscriptionPlansApi.list();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const planSmsQuota = (plan: SubscriptionPlan) => {
    if (!Array.isArray(plan.notification_channels)) return 0;
    const smsChannel = plan.notification_channels.find((ch: any) => ch?.channel === 'sms') as any;
    if (smsChannel?.monthly_quota) return smsChannel.monthly_quota;
    return (plan as any).sms_quota_monthly || 0;
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setForm({
      name: plan.name,
      name_ar: plan.name_ar,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      max_cameras: plan.max_cameras,
      max_edge_servers: plan.max_edge_servers,
      available_modules: plan.available_modules || [],
      sms_quota_monthly: planSmsQuota(plan),
      is_active: plan.is_active,
    });
  };

  const resetForm = () => {
    setForm({
      name: '',
      name_ar: '',
      price_monthly: 0,
      price_yearly: 0,
      max_cameras: 4,
      max_edge_servers: 1,
      available_modules: [],
      sms_quota_monthly: 0,
      is_active: true,
    });
  };

  const buildChannels = (smsQuota: number) => ([
    { channel: 'sms', monthly_quota: smsQuota, is_enabled: true },
    { channel: 'push', is_enabled: true },
    { channel: 'email', is_enabled: true },
  ]);

  const savePlan = async () => {
    try {
      const payload = {
        ...form,
        notification_channels: buildChannels(form.sms_quota_monthly),
      } as any;

      if (editingPlan) {
        await subscriptionPlansApi.update(editingPlan, payload);
        setEditingPlan(null);
      } else {
        await subscriptionPlansApi.create(payload);
        setShowCreate(false);
      }
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const toggleActive = async (plan: SubscriptionPlan) => {
    try {
      await subscriptionPlansApi.update(plan.id, { is_active: !plan.is_active });
      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan', error);
    }
  };

  const getPlanColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'basic': return 'from-blue-500/20 to-blue-500/5 border-blue-500/30';
      case 'professional': return 'from-stc-gold/20 to-stc-gold/5 border-stc-gold/30';
      case 'enterprise': return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30';
      default: return 'from-white/10 to-white/5 border-white/20';
    }
  };

  const getPlanIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'basic': return 'text-blue-400';
      case 'professional': return 'text-stc-gold';
      case 'enterprise': return 'text-emerald-400';
      default: return 'text-white/60';
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const smsQuota = planSmsQuota(plan);

    if (editingPlan === plan.id) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50">اسم الباقة</label>
              <input
                type="text"
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">الاسم (انجليزي)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input mt-1"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">السعر الشهري (ج.م)</label>
              <input
                type="number"
                value={form.price_monthly}
                onChange={(e) => setForm({ ...form, price_monthly: parseFloat(e.target.value) })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">السعر السنوي (ج.م)</label>
              <input
                type="number"
                value={form.price_yearly}
                onChange={(e) => setForm({ ...form, price_yearly: parseFloat(e.target.value) })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">الحد الاقصى للكاميرات</label>
              <input
                type="number"
                value={form.max_cameras}
                onChange={(e) => setForm({ ...form, max_cameras: parseInt(e.target.value) })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">الحد الاقصى للسيرفرات</label>
              <input
                type="number"
                value={form.max_edge_servers}
                onChange={(e) => setForm({ ...form, max_edge_servers: parseInt(e.target.value) })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">حصة SMS الشهرية</label>
              <input
                type="number"
                value={form.sms_quota_monthly}
                onChange={(e) => setForm({ ...form, sms_quota_monthly: parseInt(e.target.value) })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">الوحدات المفعلة</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AI_MODULES.map((module) => {
                  const checked = form.available_modules.includes(module.id);
                  return (
                    <label key={module.id} className={`px-3 py-2 rounded-lg text-xs cursor-pointer border ${checked ? 'border-stc-gold text-stc-gold' : 'border-white/20 text-white/70'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...form.available_modules, module.id]
                            : form.available_modules.filter((m) => m !== module.id);
                          setForm({ ...form, available_modules: updated });
                        }}
                        className="mr-2"
                      />
                      {module.nameAr}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={savePlan} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              حفظ
            </button>
            <button onClick={() => { setEditingPlan(null); resetForm(); }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              الغاء
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{plan.price_monthly.toLocaleString()}</span>
            <span className="text-white/60">ج.م / شهر</span>
          </div>
          <p className="text-sm text-white/50 mt-1">
            او {plan.price_yearly.toLocaleString()} ج.م / سنة
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70">الكاميرات</span>
            <span className="font-medium">{plan.max_cameras}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70">السيرفرات</span>
            <span className="font-medium">{plan.max_edge_servers}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70">حصة SMS</span>
            <span className="font-medium">{smsQuota.toLocaleString()} شهرياً</span>
          </div>
          <div className="py-2">
            <p className="text-white/70 mb-2">الوحدات المتاحة:</p>
            <div className="flex flex-wrap gap-1">
              {plan.available_modules?.map((moduleId) => {
                const module = AI_MODULES.find(m => m.id === moduleId);
                return module ? (
                  <span key={moduleId} className="text-xs px-2 py-1 bg-white/10 rounded">
                    {module.nameAr}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => openEdit(plan)}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            تعديل
          </button>
          <button
            onClick={() => toggleActive(plan)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${plan.is_active ? 'border-emerald-400 text-emerald-300' : 'border-white/30 text-white/70'}`}
            title={plan.is_active ? 'تعطيل الباقة' : 'تفعيل الباقة'}
          >
            {plan.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {plan.is_active ? 'نشطة' : 'معطلة'}
          </button>
        </div>
      </>
    );
  };

  const createModal = useMemo(() => (
    <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="انشاء باقة جديدة" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">اسم الباقة</label>
            <input
              type="text"
              value={form.name_ar}
              onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">الاسم (انجليزي)</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              dir="ltr"
            />
          </div>
          <div>
            <label className="label">السعر الشهري</label>
            <input
              type="number"
              value={form.price_monthly}
              onChange={(e) => setForm({ ...form, price_monthly: parseFloat(e.target.value) })}
              className="input"
              min={0}
            />
          </div>
          <div>
            <label className="label">السعر السنوي</label>
            <input
              type="number"
              value={form.price_yearly}
              onChange={(e) => setForm({ ...form, price_yearly: parseFloat(e.target.value) })}
              className="input"
              min={0}
            />
          </div>
          <div>
            <label className="label">الحد الاقصى للكاميرات</label>
            <input
              type="number"
              value={form.max_cameras}
              onChange={(e) => setForm({ ...form, max_cameras: parseInt(e.target.value) })}
              className="input"
              min={1}
            />
          </div>
          <div>
            <label className="label">الحد الاقصى للسيرفرات</label>
            <input
              type="number"
              value={form.max_edge_servers}
              onChange={(e) => setForm({ ...form, max_edge_servers: parseInt(e.target.value) })}
              className="input"
              min={1}
            />
          </div>
          <div>
            <label className="label">حصة SMS الشهرية</label>
            <input
              type="number"
              value={form.sms_quota_monthly}
              onChange={(e) => setForm({ ...form, sms_quota_monthly: parseInt(e.target.value) })}
              className="input"
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="label">الوحدات المتاحة</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {AI_MODULES.map((module) => {
              const checked = form.available_modules.includes(module.id);
              return (
                <label key={module.id} className={`px-3 py-2 rounded-lg text-xs cursor-pointer border ${checked ? 'border-stc-gold text-stc-gold' : 'border-white/20 text-white/70'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...form.available_modules, module.id]
                        : form.available_modules.filter((m) => m !== module.id);
                      setForm({ ...form, available_modules: updated });
                    }}
                    className="mr-2"
                  />
                  {module.nameAr}
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setShowCreate(false)}>اغلاق</button>
          <button className="btn-primary" onClick={savePlan}>انشاء الباقة</button>
        </div>
      </div>
    </Modal>
  ), [form, showCreate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-stc-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الباقات</h1>
          <p className="text-white/60">ادارة باقات الاشتراك وحصص SMS</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="w-4 h-4" />
          <span>انشاء باقة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card p-6 bg-gradient-to-br border ${getPlanColor(plan.name)}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{plan.name_ar}</h3>
                  {plan.is_active && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-sm text-white/60">{plan.name}</p>
              </div>
              <CreditCard className={`w-8 h-8 ${getPlanIcon(plan.name)}`} />
            </div>

            {renderPlanCard(plan)}
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">مقارنة الباقات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right p-3 font-medium text-white/70">الميزة</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center p-3 font-medium">{plan.name_ar}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="p-3 text-white/70">السعر الشهري</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-3 text-center">{plan.price_monthly} ج.م</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 text-white/70">حصة SMS</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-3 text-center">{planSmsQuota(plan)} / شهر</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 text-white/70">الكاميرات</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-3 text-center">{plan.max_cameras}</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 text-white/70">السيرفرات</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-3 text-center">{plan.max_edge_servers}</td>
                ))}
              </tr>
              {AI_MODULES.map((module) => (
                <tr key={module.id} className="border-b border-white/5">
                  <td className="p-3 text-white/70">{module.nameAr}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="p-3 text-center">
                      {plan.available_modules?.includes(module.id) ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-white/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {createModal}
    </div>
  );
}
