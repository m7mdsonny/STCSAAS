import { useEffect, useMemo, useState } from 'react';
import { Plus, Zap, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { aiCommandsApi } from '../../lib/api';
import type { AICommand } from '../../types/database';
import { Modal } from '../../components/ui/Modal';

type Tab = 'templates' | 'queue' | 'history';

const statusBadge = (status: string) => {
  switch (status) {
    case 'acknowledged':
      return 'badge-success';
    case 'failed':
      return 'badge-danger';
    case 'sent':
      return 'badge-warning';
    case 'template':
      return 'badge-secondary';
    default:
      return 'badge-info';
  }
};

export function AICommandsPage() {
  const [tab, setTab] = useState<Tab>('queue');
  const [commands, setCommands] = useState<AICommand[]>([]);
  const [templates, setTemplates] = useState<AICommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    command_type: 'enable_module',
    payload: '{}',
    is_template: false,
  });

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'templates') {
        const res = await aiCommandsApi.list({ templates_only: true, per_page: 50 });
        setTemplates(res.data);
      } else if (tab === 'queue') {
        const res = await aiCommandsApi.list({ status: 'pending', per_page: 50 });
        setCommands(res.data);
      } else {
        const res = await aiCommandsApi.list({ per_page: 50 });
        setCommands(res.data);
      }
    } catch (error) {
      console.error('Failed to load commands', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const createCommand = async () => {
    setFormError(null);
    let payload: Record<string, unknown> = {};

    try {
      payload = form.payload ? JSON.parse(form.payload) : {};
    } catch (error) {
      console.error('Invalid JSON payload', error);
      setFormError('صيغة JSON غير صحيحة. يرجى التحقق من القيم.');
      return;
    }

    setCreating(true);
    try {
      await aiCommandsApi.create({
        title: form.title,
        command_type: form.command_type,
        payload,
        is_template: form.is_template,
      });
      setShowModal(false);
      setForm({ title: '', command_type: 'enable_module', payload: '{}', is_template: false });
      loadData();
    } catch (error) {
      console.error('Failed to create command', error);
    } finally {
      setCreating(false);
    }
  };

  const acknowledge = async (id: string) => {
    await aiCommandsApi.ack(id);
    loadData();
  };

  const visibleList = useMemo(() => (tab === 'templates' ? templates : commands), [tab, templates, commands]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مركز اوامر الذكاء</h1>
          <p className="text-white/60">انشاء الاوامر ومتابعة حالة الارسال والـ Ack</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>انشاء امر</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab('queue')}
          className={`px-4 py-2 rounded-lg border ${tab === 'queue' ? 'border-stc-gold text-stc-gold' : 'border-white/10 text-white/70'}`}
        >
          قائمة الانتظار
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`px-4 py-2 rounded-lg border ${tab === 'templates' ? 'border-stc-gold text-stc-gold' : 'border-white/10 text-white/70'}`}
        >
          القوالب
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-lg border ${tab === 'history' ? 'border-stc-gold text-stc-gold' : 'border-white/10 text-white/70'}`}
        >
          السجل
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">الاوامر</h2>
          <button className="btn-secondary flex items-center gap-2" onClick={loadData}>
            <RefreshCcw className="w-4 h-4" />
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-stc-gold" />
          </div>
        ) : visibleList.length === 0 ? (
          <div className="text-center py-10 text-white/60">لا توجد بيانات</div>
        ) : (
          <div className="space-y-3">
            {visibleList.map((cmd) => (
              <div key={cmd.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-stc-gold" />
                      <p className="font-semibold">{cmd.title}</p>
                      <span className={`badge ${statusBadge(cmd.status)}`}>{cmd.status}</span>
                    </div>
                    <p className="text-xs text-white/60 mt-1" dir="ltr">{cmd.command_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cmd.status !== 'acknowledged' && (
                      <button className="btn-secondary px-3 py-2 flex items-center gap-1" onClick={() => acknowledge(cmd.id)}>
                        <CheckCircle className="w-4 h-4" />
                        Ack
                      </button>
                    )}
                  </div>
                </div>
                {cmd.targets && cmd.targets.length > 0 && (
                  <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-white/70">
                    {cmd.targets.map((t) => (
                      <div key={t.id} className="p-2 bg-white/5 rounded border border-white/10">
                        <div className="flex items-center justify-between">
                          <span>Org: {t.organization_id || 'كل'}</span>
                          <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                        </div>
                        {t.edge_server_id && <p className="mt-1">Edge: {t.edge_server_id}</p>}
                        {t.camera_group && <p className="mt-1">Group: {t.camera_group}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={closeModal} title="انشاء امر جديد" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">العنوان</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="تفعيل موديول الحريق"
            />
          </div>
          <div>
            <label className="label">نوع الامر</label>
            <input
              className="input"
              value={form.command_type}
              onChange={(e) => setForm({ ...form, command_type: e.target.value })}
              placeholder="enable_module / set_threshold"
              dir="ltr"
            />
          </div>
          <div>
            <label className="label">Payload (JSON)</label>
            <textarea
              className="input min-h-[120px]"
              value={form.payload}
              onChange={(e) => setForm({ ...form, payload: e.target.value })}
              dir="ltr"
            />
            {formError && <p className="text-sm text-red-400 mt-2">{formError}</p>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_template}
              onChange={(e) => setForm({ ...form, is_template: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5"
            />
            <span>حفظ كقالب</span>
          </label>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={closeModal}>الغاء</button>
            <button className="btn-primary" onClick={createCommand} disabled={creating}>
              {creating ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
