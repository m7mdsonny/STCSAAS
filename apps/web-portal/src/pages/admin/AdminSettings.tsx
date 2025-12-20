import { useState } from 'react';
import { Settings, Shield, Database, Globe, Mail, Server, Save } from 'lucide-react';
import { settingsApi } from '../../lib/api/settings';
import { backupsApi } from '../../lib/api/backups';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'system'>('general');
  const [saving, setSaving] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'STC AI-VAP',
    platformNameAr: 'منصة تحليل الفيديو بالذكاء الاصطناعي',
    defaultLanguage: 'ar',
    timezone: 'Africa/Cairo',
    trialDays: 14,
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    requireMfa: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@stc-solutions.com',
    fromName: 'STC AI-VAP',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save system settings
      await settingsApi.updateSystemSettings({
        site_name: generalSettings.platformName,
        default_language: generalSettings.defaultLanguage,
        default_timezone: generalSettings.timezone,
        session_timeout_minutes: securitySettings.sessionTimeout,
        max_login_attempts: securitySettings.maxLoginAttempts,
        require_2fa: securitySettings.requireMfa,
        password_min_length: securitySettings.passwordMinLength,
        smtp_host: emailSettings.smtpHost,
        smtp_port: emailSettings.smtpPort,
        smtp_username: emailSettings.smtpUser,
        smtp_from_email: emailSettings.fromEmail,
        smtp_from_name: emailSettings.fromName,
      });
      alert('تم حفظ الاعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('فشل حفظ الاعدادات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!confirm('هل تريد إنشاء نسخة احتياطية للنظام؟')) {
      return;
    }
    setCreatingBackup(true);
    try {
      await backupsApi.create();
      alert('تم بدء إنشاء النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('فشل إنشاء النسخة الاحتياطية. يرجى المحاولة مرة أخرى.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: Globe },
    { id: 'security', label: 'الامان', icon: Shield },
    { id: 'email', label: 'البريد', icon: Mail },
    { id: 'system', label: 'النظام', icon: Server },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اعدادات النظام</h1>
        <p className="text-white/60">تكوين اعدادات المنصة العامة</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-stc-gold/20 text-stc-gold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">الاعدادات العامة</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">اسم المنصة (انجليزي)</label>
                    <input
                      type="text"
                      value={generalSettings.platformName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="label">اسم المنصة (عربي)</label>
                    <input
                      type="text"
                      value={generalSettings.platformNameAr}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, platformNameAr: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">اللغة الافتراضية</label>
                    <select
                      value={generalSettings.defaultLanguage}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}
                      className="input"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">المنطقة الزمنية</label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="input"
                    >
                      <option value="Africa/Cairo">القاهرة (UTC+2)</option>
                      <option value="Asia/Riyadh">الرياض (UTC+3)</option>
                      <option value="Asia/Dubai">دبي (UTC+4)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">مدة الفترة التجريبية (ايام)</label>
                  <input
                    type="number"
                    value={generalSettings.trialDays}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, trialDays: parseInt(e.target.value) })}
                    className="input w-32"
                    min={1}
                    max={90}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">اعدادات الامان</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">مهلة انتهاء الجلسة (دقيقة)</label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                      className="input"
                      min={5}
                      max={480}
                    />
                  </div>
                  <div>
                    <label className="label">الحد الاقصى لمحاولات الدخول</label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                      className="input"
                      min={3}
                      max={10}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">الحد الادنى لطول كلمة المرور</label>
                    <input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                      className="input"
                      min={6}
                      max={32}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireMfa}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireMfa: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5"
                    />
                    <div>
                      <p className="font-medium">تفعيل المصادقة الثنائية اجباريا</p>
                      <p className="text-sm text-white/50">الزام جميع المستخدمين بتفعيل المصادقة الثنائية</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.passwordRequireSpecial}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireSpecial: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5"
                    />
                    <div>
                      <p className="font-medium">اشتراط رموز خاصة في كلمة المرور</p>
                      <p className="text-sm text-white/50">يجب ان تحتوي كلمة المرور على رموز خاصة</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">اعدادات البريد الالكتروني</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">خادم SMTP</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      className="input"
                      dir="ltr"
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <label className="label">منفذ SMTP</label>
                    <input
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">اسم المستخدم</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="label">كلمة المرور</label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">البريد المرسل</label>
                    <input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="label">اسم المرسل</label>
                    <input
                      type="text"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <button className="btn-secondary">
                  ارسال بريد تجريبي
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">معلومات النظام</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/50 mb-1">اصدار المنصة</p>
                    <p className="font-mono font-medium">v1.0.0</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/50 mb-1">اصدار قاعدة البيانات</p>
                    <p className="font-mono font-medium">PostgreSQL 15.4</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/50 mb-1">مساحة التخزين</p>
                    <p className="font-mono font-medium">45.2 GB / 100 GB</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/50 mb-1">اخر نسخة احتياطية</p>
                    <p className="font-mono font-medium">منذ 2 ساعة</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-medium mb-3">صيانة النظام</h3>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      className="btn-secondary" 
                      disabled
                      title="قريباً - سيتم إضافة هذه الميزة"
                    >
                      تنظيف الذاكرة المؤقتة
                    </button>
                    <button 
                      onClick={handleCreateBackup}
                      disabled={creatingBackup}
                      className="btn-secondary"
                      title="انشاء نسخة احتياطية للنظام"
                    >
                      {creatingBackup ? 'جاري الإنشاء...' : 'انشاء نسخة احتياطية'}
                    </button>
                    <button 
                      className="btn-secondary text-red-400 hover:bg-red-500/20" 
                      disabled
                      title="قريباً - سيتم إضافة هذه الميزة"
                    >
                      اعادة تشغيل الخدمات
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-5 h-5" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
