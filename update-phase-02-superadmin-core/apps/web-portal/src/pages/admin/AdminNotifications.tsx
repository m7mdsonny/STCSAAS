import { useEffect, useMemo, useState } from 'react';
import { Bell, Save, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
import { notificationPrioritiesApi, organizationsApi, smsQuotaApi } from '../../lib/api';
import type { NotificationPriority, Organization, SMSQuota } from '../../types/database';

interface PriorityForm {
  id?: string;
  notification_type: string;
  priority: string;
  is_critical: boolean;
}

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'حرج' },
  { value: 'high', label: 'مرتفع' },
  { value: 'normal', label: 'عادي' },
  { value: 'low', label: 'منخفض' },
];

export function AdminNotifications() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [priorities, setPriorities] = useState<NotificationPriority[]>([]);
  const [form, setForm] = useState<PriorityForm>({ notification_type: '', priority: 'normal', is_critical: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quota, setQuota] = useState<SMSQuota | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadPriorities(selectedOrg);
      loadQuota(selectedOrg);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const orgRes = await organizationsApi.getOrganizations({ per_page: 100 });
      setOrganizations(orgRes.data);
      if (orgRes.data.length > 0) {
        setSelectedOrg(orgRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load organizations', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPriorities = async (orgId: string) => {
    try {
      const data = await notificationPrioritiesApi.list(orgId);
      setPriorities(data);
    } catch (error) {
      console.error('Failed to load priorities', error);
    }
  };

  const loadQuota = async (orgId: string) => {
    try {
      const data = await smsQuotaApi.get(orgId);
      setQuota(data);
    } catch (error) {
      console.error('Failed to load quota', error);
      setQuota(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setSaving(true);
    try {
      if (form.id) {
        await notificationPrioritiesApi.update(form.id, {
          notification_type: form.notification_type,
          priority: form.priority,
          is_critical: form.is_critical,
        });
      } else {
        await notificationPrioritiesApi.create({
          organization_id: selectedOrg,
          notification_type: form.notification_type,
          priority: form.priority,
          is_critical: form.is_critical,
        });
      }
      setForm({ notification_type: '', priority: 'normal', is_critical: false, id: undefined });
      loadPriorities(selectedOrg);
    } catch (error) {
      console.error('Failed to save priority', error);
    } finally {
      setSaving(false);
    }
  };

  const editPriority = (priority: NotificationPriority) => {
    setForm({
      id: priority.id,
      notification_type: priority.notification_type,
      priority: priority.priority,
      is_critical: priority.is_critical,
    });
  };

  const deletePriority = async (id: string) => {
    try {
      await notificationPrioritiesApi.remove(id);
      if (selectedOrg) loadPriorities(selectedOrg);
    } catch (error) {
      console.error('Failed to delete priority', error);
    }
  };

  const quotaExceeded = useMemo(() => quota && quota.monthly_limit > 0 && quota.used_this_month >= quota.monthly_limit, [quota]);

  const priorityBadges: Record<string, string> = {
    critical: 'badge-danger',
    high: 'badge-warning',
    normal: 'badge-info',
    low: 'badge-secondary',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">اعدادات اولوية الاشعارات</h1>
          <p className="text-white/60">ضبط مستويات الاولوية لكل مؤسسة</p>
        </div>
      </div>

      {quotaExceeded && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">تم استهلاك حصة الرسائل لهذه المؤسسة</p>
            <p className="text-sm text-red-100/80">لن يتم تطبيق تغييرات الاولوية او ارسال تنبيهات جديدة حتى زيادة حصة الرسائل.</p>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="label">المؤسسة</label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="input"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            {quota && (
              <p className="text-xs text-white/60 mt-1">استخدام الرسائل: {quota.used_this_month} / {quota.monthly_limit}</p>
            )}
          </div>
          <div className="flex justify-end">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <ShieldCheck className="w-4 h-4 text-stc-gold" />
              <span>التغييرات تطبق فوراً عبر API</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-stc-gold" />
            القواعد الحالية
          </h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-stc-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : priorities.length === 0 ? (
            <p className="text-white/60">لا توجد قواعد محددة بعد.</p>
          ) : (
            <div className="space-y-3">
              {priorities.map((priority) => (
                <div key={priority.id} className="p-4 bg-white/5 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{priority.notification_type}</p>
                    <span className={`badge ${priorityBadges[priority.priority] || 'badge-secondary'} mt-1`}>{priority.priority}</span>
                    {priority.is_critical && <span className="badge badge-danger ml-2">حرج</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-secondary" onClick={() => editPriority(priority)} disabled={!!quotaExceeded}>تعديل</button>
                    <button className="p-2 hover:bg-red-500/20 rounded" onClick={() => deletePriority(priority.id)} disabled={!!quotaExceeded}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">اضافة / تعديل قاعدة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">نوع الاشعار</label>
              <input
                type="text"
                value={form.notification_type}
                onChange={(e) => setForm({ ...form, notification_type: e.target.value })}
                className="input"
                placeholder="مثال: alerts.camera_offline"
                required
                disabled={!!quotaExceeded}
              />
            </div>
            <div>
              <label className="label">الاولوية</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input"
                disabled={!!quotaExceeded}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_critical}
                onChange={(e) => setForm({ ...form, is_critical: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5"
                disabled={!!quotaExceeded}
              />
              <span>وضع حرج (ينتقل الى اعلى الاولويات)</span>
            </label>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={saving || !!quotaExceeded}
            >
              <Save className="w-4 h-4" />
              <span>{form.id ? 'تحديث' : 'حفظ'} القاعدة</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
