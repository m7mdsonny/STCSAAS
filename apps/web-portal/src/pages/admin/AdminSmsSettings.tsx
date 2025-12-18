import { useState, useEffect } from 'react';
import { MessageSquare, Phone, MessageCircle, Save, Plus, Building2, TrendingUp, ShoppingCart } from 'lucide-react';
import { settingsApi, organizationsApi } from '../../lib/api';
import { Modal } from '../../components/ui/Modal';
import type { Organization, SubscriptionPlan } from '../../types/database';

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

interface OrgQuota {
  id: string;
  organization_id: string;
  month: string;
  sms_used: number;
  sms_limit: number;
  whatsapp_used: number;
  whatsapp_limit: number;
  calls_used: number;
  calls_limit: number;
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

  const [purchaseForm, setPurchaseForm] = useState({
    organization_id: '',
    sms_count: 100,
    whatsapp_count: 50,
    calls_count: 10,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, smsSettings, orgsRes] = await Promise.all([
        settingsApi.getPlans(),
        settingsApi.getSmsSettings(),
        organizationsApi.getOrganizations(),
      ]);

      setPlans(plansRes);
      setOrganizations(orgsRes.data);

      // Map SMS settings to config format
      setConfig({
        id: '1', // placeholder
        sms_provider: smsSettings.provider,
        sms_api_key: smsSettings.api_key || '',
        sms_sender_id: smsSettings.sender_id || '',
        sms_base_url: '',
        whatsapp_api_key: '',
        whatsapp_phone_id: smsSettings.whatsapp_number || '',
        call_provider: 'twilio',
        call_api_key: '',
        messaging_enabled: smsSettings.whatsapp_enabled,
      });

      // Note: SMS quotas would need to be fetched from a separate endpoint
      setQuotas([]);
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

  const updatePlanQuota = async (planId: string, field: string, value: number) => {
    try {
      await settingsApi.updatePlan(planId, { [field]: value } as any);
      fetchData();
    } catch (error) {
      console.error('Error updating plan quota:', error);
    }
  };

  const addPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.organization_id) return;

    // Note: This functionality would need a dedicated API endpoint
    // For now, we'll just close the modal
    console.log('Purchase form:', purchaseForm);

    setShowPurchaseModal(false);
    setPurchaseForm({ organization_id: '', sms_count: 100, whatsapp_count: 50, calls_count: 10 });
    fetchData();
  };

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
                            value={(plan as any).sms_quota_monthly || 0}
                            onChange={(e) => updatePlanQuota(plan.id, 'sms_quota_monthly', parseInt(e.target.value))}
                            className="input"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="label flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            حصة WhatsApp الشهرية
                          </label>
                          <input
                            type="number"
                            value={(plan as any).whatsapp_quota_monthly || 0}
                            onChange={(e) => updatePlanQuota(plan.id, 'whatsapp_quota_monthly', parseInt(e.target.value))}
                            className="input"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="label flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            حصة المكالمات الشهرية
                          </label>
                          <input
                            type="number"
                            value={(plan as any).call_quota_monthly || 0}
                            onChange={(e) => updatePlanQuota(plan.id, 'call_quota_monthly', parseInt(e.target.value))}
                            className="input"
                            min={0}
                          />
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
                    const smsPercent = quota.sms_limit > 0 ? (quota.sms_used / quota.sms_limit) * 100 : 0;
                    const whatsappPercent = quota.whatsapp_limit > 0 ? (quota.whatsapp_used / quota.whatsapp_limit) * 100 : 0;
                    const callsPercent = quota.calls_limit > 0 ? (quota.calls_used / quota.calls_limit) * 100 : 0;

                    return (
                      <div key={quota.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold">{quota.organization?.name}</p>
                            <p className="text-sm text-white/50">شهر {quota.month}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                SMS
                              </span>
                              <span>{quota.sms_used} / {quota.sms_limit}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${smsPercent > 90 ? 'bg-red-500' : smsPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(smsPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                              </span>
                              <span>{quota.whatsapp_used} / {quota.whatsapp_limit}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${whatsappPercent > 90 ? 'bg-red-500' : whatsappPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(whatsappPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                مكالمات
                              </span>
                              <span>{quota.calls_used} / {quota.calls_limit}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${callsPercent > 90 ? 'bg-red-500' : callsPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(callsPercent, 100)}%` }}
                              />
                            </div>
                          </div>
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
                  <h2 className="text-lg font-semibold">شراء رسائل اضافية</h2>
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
                  <p className="text-2xl font-bold">0.50 جنيه</p>
                  <p className="text-white/60 text-sm">سعر رسالة SMS</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl text-center">
                  <MessageCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold">0.75 جنيه</p>
                  <p className="text-white/60 text-sm">سعر رسالة WhatsApp</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl text-center">
                  <Phone className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold">3.00 جنيه</p>
                  <p className="text-white/60 text-sm">سعر المكالمة</p>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">SMS</label>
              <input
                type="number"
                value={purchaseForm.sms_count}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, sms_count: parseInt(e.target.value) })}
                className="input"
                min={0}
              />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input
                type="number"
                value={purchaseForm.whatsapp_count}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, whatsapp_count: parseInt(e.target.value) })}
                className="input"
                min={0}
              />
            </div>
            <div>
              <label className="label">مكالمات</label>
              <input
                type="number"
                value={purchaseForm.calls_count}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, calls_count: parseInt(e.target.value) })}
                className="input"
                min={0}
              />
            </div>
          </div>
          <div className="p-4 bg-stc-gold/10 rounded-lg">
            <p className="text-sm text-stc-gold">
              الاجمالي: {(purchaseForm.sms_count * 0.50 + purchaseForm.whatsapp_count * 0.75 + purchaseForm.calls_count * 3).toFixed(2)} جنيه
            </p>
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
