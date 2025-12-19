import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Phone, MessageCircle, Save, Plus, Building2, TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';
import { settingsApi, organizationsApi, subscriptionPlansApi, smsQuotaApi } from '../../lib/api';
import { Modal } from '../../components/ui/Modal';
import type { Organization, SubscriptionPlan, SMSQuota } from '../../types/database';

interface PlatformSettings {
  id: string;
  sms_provider: string;
  sms_api_key: string;
  sms_sender_id: string;
  sms_base_url: string;
  whatsapp_api_key: string;
  whatsapp_phone_id: string;
  call_provider: string;
  call_api_key: string;
  messaging_enabled: boolean;
}

interface OrgQuota extends SMSQuota {
  organization?: Organization;
}

export function AdminSmsSettings() {
  const [activeTab, setActiveTab] = useState<'config' | 'plans' | 'quotas' | 'purchase'>('config');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [quotas, setQuotas] = useState<OrgQuota[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ organization_id: '', sms_count: 100 });

  const [config, setConfig] = useState<PlatformSettings>({
    id: '',
    sms_provider: 'twilio',
    sms_api_key: '',
    sms_sender_id: '',
    sms_base_url: '',
    whatsapp_api_key: '',
    whatsapp_phone_id: '',
    call_provider: 'twilio',
    call_api_key: '',
    messaging_enabled: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, smsSettings, orgsRes] = await Promise.all([
        subscriptionPlansApi.list(),
        settingsApi.getSmsSettings(),
        organizationsApi.getOrganizations({ per_page: 100 }),
      ]);

      setPlans(plansRes);
      setOrganizations(orgsRes.data);

      setConfig({
        id: 'settings',
        sms_provider: smsSettings.provider || 'twilio',
        sms_api_key: smsSettings.api_key || '',
        sms_sender_id: smsSettings.sender_id || '',
        sms_base_url: '',
        whatsapp_api_key: '',
        whatsapp_phone_id: smsSettings.whatsapp_number || '',
        call_provider: 'twilio',
        call_api_key: '',
        messaging_enabled: smsSettings.whatsapp_enabled,
      });

      const quotaList = await Promise.all(orgsRes.data.map(async (org) => {
        try {
          const quota = await smsQuotaApi.get(org.id);
          return { ...quota, organization: org } as OrgQuota;
        } catch {
          return null;
        }
      }));
      setQuotas(quotaList.filter((q): q is OrgQuota => Boolean(q)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await settingsApi.updateSmsSettings({
        provider: config.sms_provider as 'twilio' | 'unifonic' | 'custom',
        api_key: config.sms_api_key,
        sender_id: config.sms_sender_id,
        whatsapp_enabled: config.messaging_enabled,
        whatsapp_number: config.whatsapp_phone_id,
      });
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const planSmsQuota = (plan: SubscriptionPlan) => {
    if (!Array.isArray(plan.notification_channels)) return 0;
    const smsChannel = plan.notification_channels.find((ch: any) => ch?.channel === 'sms') as any;
    return smsChannel?.monthly_quota || 0;
  };

  const updatePlanQuota = async (planId: string, smsQuota: number) => {
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;
      const updatedChannels = [
        { channel: 'sms', monthly_quota: smsQuota, is_enabled: true },
        { channel: 'push', is_enabled: true },
        { channel: 'email', is_enabled: true },
      ];
      await subscriptionPlansApi.update(planId, { notification_channels: updatedChannels } as any);
      fetchData();
    } catch (error) {
      console.error('Error updating plan quota:', error);
    }
  };

  const addPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.organization_id || purchaseForm.sms_count <= 0) return;

    try {
      const currentQuota = quotas.find((q) => q.organization_id === purchaseForm.organization_id);
      const newLimit = (currentQuota?.monthly_limit || 0) + purchaseForm.sms_count;
      await smsQuotaApi.update(purchaseForm.organization_id, { monthly_limit: newLimit });
      await fetchData();
    } catch (error) {
      console.error('Failed to update quota', error);
    } finally {
      setShowPurchaseModal(false);
      setPurchaseForm({ organization_id: '', sms_count: 100 });
    }
  };

  const exceededOrgs = useMemo(() => quotas.filter((q) => q.monthly_limit > 0 && q.used_this_month >= q.monthly_limit), [quotas]);

  const tabs = [
    { id: 'config', label: 'سيرفر الرسائل', icon: MessageSquare },
    { id: 'plans', label: 'حصص الباقات', icon: TrendingUp },
    { id: 'quotas', label: 'استهلاك العملاء', icon: Building2 },
    { id: 'purchase', label: 'شراء اضافي', icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اعدادات الرسائل</h1>
        <p className="text-white/60">ادارة سيرفر الرسائل وحصص العملاء</p>
      </div>

      {exceededOrgs.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">تم استهلاك حصة الرسائل لبعض المؤسسات</p>
            <ul className="list-disc pr-4 text-sm text-red-100/80">
              {exceededOrgs.map((q) => (
                <li key={q.id}>{q.organization?.name} ({q.used_this_month}/{q.monthly_limit})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id ? 'bg-stc-gold/20 text-stc-gold' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-stc-gold" />
                  اعدادات SMS
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">مزود الخدمة</label>
                      <select
                        value={config.sms_provider}
                        onChange={(e) => setConfig({ ...config, sms_provider: e.target.value })}
                        className="input"
                      >
                        <option value="twilio">Twilio</option>
                        <option value="unifonic">Unifonic</option>
                        <option value="mobily">Mobily</option>
                        <option value="custom">مخصص</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">معرف المرسل (Sender ID)</label>
                      <input
                        type="text"
                        value={config.sms_sender_id}
                        onChange={(e) => setConfig({ ...config, sms_sender_id: e.target.value })}
                        className="input"
                        dir="ltr"
                        placeholder="STC-AI"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">مفتاح API</label>
                    <input
                      type="password"
                      value={config.sms_api_key}
                      onChange={(e) => setConfig({ ...config, sms_api_key: e.target.value })}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                  {config.sms_provider === 'custom' && (
                    <div>
                      <label className="label">رابط API</label>
                      <input
                        type="url"
                        value={config.sms_base_url}
                        onChange={(e) => setConfig({ ...config, sms_base_url: e.target.value })}
                        className="input"
                        dir="ltr"
                        placeholder="https://api.example.com/sms"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                  اعدادات WhatsApp
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">مفتاح WhatsApp Business API</label>
                    <input
                      type="password"
                      value={config.whatsapp_api_key}
                      onChange={(e) => setConfig({ ...config, whatsapp_api_key: e.target.value })}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number ID</label>
                    <input
                      type="text"
                      value={config.whatsapp_phone_id}
                      onChange={(e) => setConfig({ ...config, whatsapp_phone_id: e.target.value })}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-500" />
                  اعدادات المكالمات
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">مزود خدمة الاتصال</label>
                      <select
                        value={config.call_provider}
                        onChange={(e) => setConfig({ ...config, call_provider: e.target.value })}
                        className="input"
                      >
                        <option value="twilio">Twilio</option>
                        <option value="vonage">Vonage</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">مفتاح API</label>
                      <input
                        type="password"
                        value={config.call_api_key}
                        onChange={(e) => setConfig({ ...config, call_api_key: e.target.value })}
                        className="input"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.messaging_enabled}
                    onChange={(e) => setConfig({ ...config, messaging_enabled: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5"
                  />
                  <span>تفعيل خدمات الرسائل</span>
                </label>
                <button onClick={saveConfig} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ الاعدادات'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">حصص الرسائل لكل باقة</h2>
              <p className="text-white/60 text-sm mb-6">تحديد عدد الرسائل الشهرية المتاحة لكل باقة اشتراك</p>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-stc-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {plans.map(plan => (
                    <div key={plan.id} className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{plan.name_ar}</h3>
                          <p className="text-sm text-white/50">{plan.name}</p>
                        </div>
                        <span className="text-stc-gold font-bold">{plan.price_monthly} جنيه/شهر</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="label flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            حصة SMS الشهرية
                          </label>
                          <input
                            type="number"
                            value={planSmsQuota(plan)}
                            onChange={(e) => updatePlanQuota(plan.id, parseInt(e.target.value))}
                            className="input"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="label flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </label>
                          <input type="number" value={0} disabled className="input" />
                        </div>
                        <div>
                          <label className="label flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            مكالمات
                          </label>
                          <input type="number" value={0} disabled className="input" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotas' && (
            <div className="card">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">استهلاك العملاء</h2>
                <p className="text-white/60 text-sm">متابعة استهلاك الرسائل لكل مؤسسة</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-stc-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : quotas.length === 0 ? (
                <div className="text-center py-12 text-white/50">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>لا توجد بيانات استهلاك</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {quotas.map(quota => {
                    const smsPercent = quota.monthly_limit > 0 ? (quota.used_this_month / quota.monthly_limit) * 100 : 0;
                    return (
                      <div key={quota.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold">{quota.organization?.name}</p>
                            <p className="text-sm text-white/50">الحصة الشهرية: {quota.monthly_limit}</p>
                          </div>
                          <button
                            className="btn-secondary"
                            onClick={() => smsQuotaApi.update(quota.organization_id, { monthly_limit: quota.monthly_limit })}
                          >
                            تحديث الحصة
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                SMS
                              </span>
                              <span>{quota.used_this_month} / {quota.monthly_limit}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${smsPercent >= 100 ? 'bg-red-500' : smsPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(smsPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                          {smsPercent >= 100 && (
                            <p className="text-sm text-red-400">تم تجاوز الحصة المسموح بها. سيتم حظر ارسال الرسائل حتى زيادة الحد.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchase' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">زيادة حصة الرسائل</h2>
                  <p className="text-white/60 text-sm">اضافة حصة رسائل اضافية للعملاء</p>
                </div>
                <button onClick={() => setShowPurchaseModal(true)} className="btn-primary flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>اضافة حصة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-xl text-center">
                  <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm text-white/60">حدد المؤسسة واضف عدد الرسائل المطلوب</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl text-center">
                  <MessageCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm text-white/60">التحديث يتم مباشرة عبر API</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl text-center">
                  <Phone className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm text-white/60">لا حاجة لتدخل يدوي من السيرفر</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="اضافة حصة رسائل">
        <form onSubmit={addPurchase} className="space-y-4">
          <div>
            <label className="label">المؤسسة</label>
            <select
              value={purchaseForm.organization_id}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, organization_id: e.target.value })}
              className="input"
              required
            >
              <option value="">اختر المؤسسة</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">عدد الرسائل</label>
            <input
              type="number"
              value={purchaseForm.sms_count}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, sms_count: parseInt(e.target.value) })}
              className="input"
              min={1}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setShowPurchaseModal(false)} className="btn-secondary">الغاء</button>
            <button type="submit" className="btn-primary">اضافة الحصة</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
