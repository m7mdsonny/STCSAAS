import { useEffect, useState } from 'react';
import { Database, Globe, Save, Upload, Download, RefreshCcw, Shield, Layers } from 'lucide-react';
import { brandingApi, backupsApi, updatesApi } from '../../lib/api';
import type { PlatformBranding, BackupRecord, UpdatePackage } from '../../types/database';
import { applyBranding } from '../../lib/brandingTheme';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'branding' | 'backups' | 'updates'>('branding');
  const [branding, setBranding] = useState<PlatformBranding | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [updates, setUpdates] = useState<UpdatePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    version: '',
    title: '',
    notes: '',
    payload: '{}',
    target_all: true,
    target_organizations: '' as string,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [brandingRes, backupsRes, updatesRes] = await Promise.all([
        brandingApi.getGlobal(),
        backupsApi.list(),
        updatesApi.list(),
      ]);
      setBranding(brandingRes);
      setBackups(backupsRes);
      setUpdates(updatesRes);
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async () => {
    if (!branding) return;
    setSavingBranding(true);
    try {
      const updated = await brandingApi.updateGlobal(branding);
      applyBranding(updated);
      setBranding(updated);
    } catch (error) {
      console.error('Failed to update branding', error);
    } finally {
      setSavingBranding(false);
    }
  };

  const triggerBackup = async () => {
    setCreatingBackup(true);
    try {
      const backup = await backupsApi.create();
      setBackups([backup, ...backups]);
    } catch (error) {
      console.error('Backup failed', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestore = async (id: string) => {
    await backupsApi.restore(id);
    await loadData();
  };

  const createUpdate = async () => {
    try {
      const payload = updateForm.payload ? JSON.parse(updateForm.payload) : {};
      const targets = updateForm.target_organizations
        ? updateForm.target_organizations.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined;
      const created = await updatesApi.create({
        version: updateForm.version,
        title: updateForm.title,
        notes: updateForm.notes,
        payload,
        target_all: updateForm.target_all,
        target_organizations: targets,
      });
      setUpdates([created, ...updates]);
      setUpdateForm({ version: '', title: '', notes: '', payload: '{}', target_all: true, target_organizations: '' });
    } catch (error) {
      console.error('Failed to create update', error);
    }
  };

  const tabs = [
    { id: 'branding', label: 'الهوية والالوان', icon: Globe },
    { id: 'backups', label: 'النسخ الاحتياطي', icon: Database },
    { id: 'updates', label: 'توزيع التحديثات', icon: Layers },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-stc-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اعدادات النظام</h1>
        <p className="text-white/60">التحكم في الهوية، النسخ الاحتياطي، وتوزيع التحديثات</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-2">
            {tabs.map((tab) => (
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

        <div className="flex-1 space-y-4">
          {activeTab === 'branding' && branding && (
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">الهوية والعلامة التجارية</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">رابط الشعار (فاتح)</label>
                  <input
                    type="text"
                    value={branding.logo_url || ''}
                    onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                    className="input"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">رابط الشعار (داكن)</label>
                  <input
                    type="text"
                    value={branding.logo_dark_url || ''}
                    onChange={(e) => setBranding({ ...branding, logo_dark_url: e.target.value })}
                    className="input"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">رابط الايقونة (favicon)</label>
                  <input
                    type="text"
                    value={branding.favicon_url || ''}
                    onChange={(e) => setBranding({ ...branding, favicon_url: e.target.value })}
                    className="input"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">لون اساسي</label>
                  <input
                    type="text"
                    value={branding.primary_color || ''}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="input"
                    dir="ltr"
                    placeholder="#DCA000"
                  />
                </div>
                <div>
                  <label className="label">لون ثانوي</label>
                  <input
                    type="text"
                    value={branding.secondary_color || ''}
                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                    className="input"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">لون تكميلي</label>
                  <input
                    type="text"
                    value={branding.accent_color || ''}
                    onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                    className="input"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="label">CSS مخصص</label>
                <textarea
                  value={branding.custom_css || ''}
                  onChange={(e) => setBranding({ ...branding, custom_css: e.target.value })}
                  className="input min-h-[120px]"
                  dir="ltr"
                  placeholder={":root { --brand-primary: #DCA000; }"}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button className="btn-secondary flex items-center gap-2" onClick={() => branding && applyBranding(branding)}>
                  <RefreshCcw className="w-4 h-4" />
                  معاينة فورية
                </button>
                <button className="btn-primary flex items-center gap-2" onClick={saveBranding} disabled={savingBranding}>
                  <Save className="w-4 h-4" />
                  حفظ
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">النسخ الاحتياطي</h2>
                  <p className="text-white/60 text-sm">انشاء، تحميل، واستعادة النسخ الاحتياطية</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary flex items-center gap-2" onClick={triggerBackup} disabled={creatingBackup}>
                    <Database className="w-4 h-4" />
                    {creatingBackup ? 'جاري الانشاء...' : 'انشاء نسخة'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right p-3 text-white/70">الملف</th>
                      <th className="text-right p-3 text-white/70">الحالة</th>
                      <th className="text-right p-3 text-white/70">التوقيت</th>
                      <th className="text-right p-3 text-white/70">اجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.id} className="border-b border-white/5">
                        <td className="p-3 text-sm" dir="ltr">{backup.file_path}</td>
                        <td className="p-3">
                          <span className={`badge ${backup.status === 'restored' ? 'badge-success' : 'badge-info'}`}>{backup.status}</span>
                        </td>
                        <td className="p-3 text-white/60">{backup.created_at ? new Date(backup.created_at).toLocaleString() : '-'}</td>
                        <td className="p-3 flex items-center gap-2">
                          <a className="btn-secondary px-3 py-2" href={backupsApi.downloadUrl(backup.id)} target="_blank" rel="noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                          <button className="btn-secondary px-3 py-2" onClick={() => handleRestore(backup.id)}>
                            <Upload className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {backups.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-white/60">لا توجد نسخ احتياطية بعد.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">توزيع التحديثات / السياسات</h2>
                  <p className="text-white/60 text-sm">ارسال حزم التحديث الى كل المنظمات او منظمة محددة</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  className="input"
                  placeholder="الاصدار (مثال v1.2.0)"
                  value={updateForm.version}
                  onChange={(e) => setUpdateForm({ ...updateForm, version: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="العنوان"
                  value={updateForm.title}
                  onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="ملاحظات"
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="معرفات المؤسسات (مفصولة بفاصلة)"
                  value={updateForm.target_organizations}
                  onChange={(e) => setUpdateForm({ ...updateForm, target_organizations: e.target.value, target_all: !e.target.value })}
                />
                <div className="md:col-span-2">
                  <label className="label">Payload (JSON)</label>
                  <textarea
                    className="input min-h-[120px]"
                    dir="ltr"
                    value={updateForm.payload}
                    onChange={(e) => setUpdateForm({ ...updateForm, payload: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2" onClick={createUpdate}>
                  <Shield className="w-4 h-4" />
                  نشر التحديث
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right p-3 text-white/70">الاصدار</th>
                      <th className="text-right p-3 text-white/70">الحالة</th>
                      <th className="text-right p-3 text-white/70">الهدف</th>
                      <th className="text-right p-3 text-white/70">اجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updates.map((item) => (
                      <tr key={item.id} className="border-b border-white/5">
                        <td className="p-3">{item.version}</td>
                        <td className="p-3"><span className={`badge ${item.status === 'applied' ? 'badge-success' : 'badge-warning'}`}>{item.status}</span></td>
                        <td className="p-3 text-sm">{item.target_all ? 'كل المنظمات' : (item.target_organizations || []).join(', ')}</td>
                        <td className="p-3">
                          <button className="btn-secondary px-3 py-2" onClick={() => updatesApi.apply(item.id)}>
                            تطبيق
                          </button>
                        </td>
                      </tr>
                    ))}
                    {updates.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-white/60">لا توجد تحديثات مسجلة.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
