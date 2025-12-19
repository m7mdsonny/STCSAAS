import { useEffect, useMemo, useState } from 'react';
import { Key, Plus, Search, Trash2, Copy, CheckCircle, XCircle, Calendar, Building2, RefreshCcw, Edit2 } from 'lucide-react';
import { licensesApi, organizationsApi, subscriptionPlansApi } from '../../lib/api';
import { Modal } from '../../components/ui/Modal';
import type { License, Organization, SubscriptionPlan } from '../../types/database';
import { AI_MODULES } from '../../types/database';

interface LicenseForm {
  id?: string;
  organization_id: string;
  plan: License['plan'];
  max_cameras: number;
  modules: string[];
  expires_at?: string;
  status?: License['status'];
}

export function Licenses() {
  const [licenses, setLicenses] = useState<(License & { organization?: Organization })[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [form, setForm] = useState<LicenseForm>({
    organization_id: '',
    plan: 'basic',
    max_cameras: 8,
    modules: [],
    expires_at: '',
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [licensesRes, orgsRes, plansRes] = await Promise.all([
        licensesApi.getLicenses({ per_page: 100 }),
        organizationsApi.getOrganizations({ per_page: 100 }),
        subscriptionPlansApi.list(),
      ]);

      setOrganizations(orgsRes.data);
      setPlans(plansRes);

      const enriched = licensesRes.data.map(license => ({
        ...license,
        organization: orgsRes.data.find(o => o.id === license.organization_id),
      }));
      setLicenses(enriched);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openCreate = () => {
    const defaultPlan = plans[0];
    setForm({
      organization_id: '',
      plan: (defaultPlan?.name || 'basic') as License['plan'],
      max_cameras: defaultPlan?.max_cameras || 4,
      modules: defaultPlan?.available_modules || [],
      expires_at: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const openEdit = (license: License) => {
    setForm({
      id: license.id,
      organization_id: license.organization_id,
      plan: license.plan,
      max_cameras: license.max_cameras,
      modules: license.modules || [],
      expires_at: license.expires_at || '',
      status: license.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        await licensesApi.updateLicense(form.id, {
          plan: form.plan,
          max_cameras: form.max_cameras,
          modules: form.modules,
          expires_at: form.expires_at || undefined,
          status: form.status,
        });
      } else {
        await licensesApi.createLicense({
          organization_id: form.organization_id,
          plan: form.plan,
          max_cameras: form.max_cameras,
          modules: form.modules,
          expires_at: form.expires_at || undefined,
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving license:', error);
    }
  };

  const deleteLicense = async (id: string) => {
    if (!confirm('هل انت متاكد من حذف هذا الترخيص؟')) return;
    try {
      await licensesApi.deleteLicense(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting license:', error);
    }
  };

  const updateStatus = async (id: string, status: License['status']) => {
    try {
      if (status === 'active') {
        await licensesApi.activate(id);
      } else if (status === 'suspended') {
        await licensesApi.suspend(id);
      }
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const renew = async (id: string, expiresAt: string) => {
    try {
      await licensesApi.renew(id, expiresAt);
      fetchData();
    } catch (error) {
      console.error('Error renewing license', error);
    }
  };

  const regenerateKey = async (id: string) => {
    try {
      await licensesApi.regenerateKey(id);
      fetchData();
    } catch (error) {
      console.error('Error regenerating key', error);
    }
  };

  const filteredLicenses = useMemo(() => {
    return licenses.filter(license => {
      const matchesSearch = license.license_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        license.organization?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
      const matchesPlan = planFilter === 'all' || license.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [licenses, searchQuery, statusFilter, planFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'trial': return 'badge-warning';
      case 'expired': return 'badge-danger';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'trial': return 'تجريبي';
      case 'expired': return 'منتهي';
      case 'suspended': return 'موقوف';
      default: return status;
    }
  };

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    trial: licenses.filter(l => l.status === 'trial').length,
    expired: licenses.filter(l => l.status === 'expired').length,
  };

  const selectedPlanModules = useMemo(() => {
    const plan = plans.find((p) => p.name === form.plan);
    return plan?.available_modules || [];
  }, [form.plan, plans]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">التراخيص</h1>
          <p className="text-white/60">ادارة تراخيص المنصة</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>انشاء ترخيص</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-stc-gold/20 to-stc-gold/5">
              <Key className="w-6 h-6 text-stc-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-white/60">الاجمالي</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-white/60">نشط</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.trial}</p>
              <p className="text-sm text-white/60">تجريبي</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.expired}</p>
              <p className="text-sm text-white/60">منتهي</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="بحث بالمفتاح او المؤسسة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pr-12 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="trial">تجريبي</option>
            <option value="expired">منتهي</option>
            <option value="suspended">موقوف</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="input"
          >
            <option value="all">كل الباقات</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.name}>{plan.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-stc-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLicenses.length === 0 ? (
        <div className="card p-12 text-center">
          <Key className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد تراخيص</h3>
          <p className="text-white/60">لم يتم انشاء اي تراخيص بعد</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right p-4 font-medium text-white/70">مفتاح الترخيص</th>
                <th className="text-right p-4 font-medium text-white/70">المؤسسة</th>
                <th className="text-right p-4 font-medium text-white/70">الباقة</th>
                <th className="text-right p-4 font-medium text-white/70">الكاميرات</th>
                <th className="text-right p-4 font-medium text-white/70">الوحدات</th>
                <th className="text-right p-4 font-medium text-white/70">الحالة</th>
                <th className="text-right p-4 font-medium text-white/70">تاريخ الانتهاء</th>
                <th className="text-right p-4 font-medium text-white/70">اجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map((license) => (
                <tr key={license.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-white/10 px-2 py-1 rounded">{license.license_key}</code>
                      <button onClick={() => copyKey(license.license_key)} className="p-1 hover:bg-white/10 rounded">
                        {copiedKey === license.license_key ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/50" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-white/50" />
                      <span>{license.organization?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{license.plan}</td>
                  <td className="p-4">{license.max_cameras}</td>
                  <td className="p-4 text-sm text-white/70 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {(license.modules || []).map((module) => (
                        <span key={module} className="px-2 py-1 bg-white/10 rounded text-xs">{module}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${getStatusBadge(license.status)}`}>
                      {getStatusText(license.status)}
                    </span>
                  </td>
                  <td className="p-4 text-white/60">
                    {license.expires_at ? new Date(license.expires_at).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => regenerateKey(license.id)}
                        className="p-2 hover:bg-white/10 rounded"
                        title="تجديد المفتاح"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(license)}
                        className="p-2 hover:bg-white/10 rounded"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {license.status === 'suspended' ? (
                        <button
                          onClick={() => updateStatus(license.id, 'active')}
                          className="p-2 hover:bg-emerald-500/20 rounded"
                          title="تفعيل"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </button>
                      ) : license.status === 'active' && (
                        <button
                          onClick={() => updateStatus(license.id, 'suspended')}
                          className="p-2 hover:bg-orange-500/20 rounded"
                          title="ايقاف"
                        >
                          <XCircle className="w-4 h-4 text-orange-400" />
                        </button>
                      )}
                      <button onClick={() => deleteLicense(license.id)} className="p-2 hover:bg-red-500/20 rounded">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={form.id ? 'تعديل الترخيص' : 'انشاء ترخيص جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">المؤسسة</label>
            <select
              value={form.organization_id}
              onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
              className="input"
              required={!form.id}
              disabled={!!form.id}
            >
              <option value="">اختر المؤسسة</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">الباقة</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value as License['plan'] })}
                className="input"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.name}>{plan.name_ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">عدد الكاميرات</label>
              <input
                type="number"
                value={form.max_cameras}
                onChange={(e) => setForm({ ...form, max_cameras: parseInt(e.target.value) })}
                className="input"
                min={1}
                max={128}
              />
            </div>
          </div>

          <div>
            <label className="label">الوحدات المغطاة</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedPlanModules.length === 0 && (
                <p className="text-sm text-white/60">لم يتم تفعيل وحدات لهذه الباقة بعد.</p>
              )}
              {AI_MODULES.filter((m) => selectedPlanModules.length === 0 || selectedPlanModules.includes(m.id)).map((module) => {
                const checked = form.modules.includes(module.id);
                return (
                  <label key={module.id} className={`px-3 py-2 rounded-lg text-xs cursor-pointer border ${checked ? 'border-stc-gold text-stc-gold' : 'border-white/20 text-white/70'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...form.modules, module.id]
                          : form.modules.filter((m) => m !== module.id);
                        setForm({ ...form, modules: updated });
                      }}
                      className="mr-2"
                    />
                    {module.nameAr}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">تاريخ الانتهاء</label>
              <input
                type="date"
                value={form.expires_at ? form.expires_at.slice(0, 10) : ''}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">الحالة</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as License['status'] })}
                className="input"
              >
                <option value="active">نشط</option>
                <option value="suspended">موقوف</option>
                <option value="expired">منتهي</option>
                <option value="trial">تجريبي</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              الغاء
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => form.expires_at && renew(form.id!, form.expires_at!)}
                className="btn-secondary"
              >
                تجديد
              </button>
            )}
            <button type="submit" className="btn-primary">
              {form.id ? 'حفظ' : 'انشاء الترخيص'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
