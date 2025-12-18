import { useState } from 'react';
import { Bell, Send, Users, Building2, AlertTriangle } from 'lucide-react';

export function AdminNotifications() {
  const [notificationType, setNotificationType] = useState<'all' | 'org' | 'critical'>('all');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) return;
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setTitle('');
    setMessage('');
    alert('تم ارسال الاشعار بنجاح');
  };

  const recentNotifications = [
    {
      id: '1',
      title: 'تحديث النظام',
      message: 'تم تحديث النظام الى الاصدار 2.0',
      type: 'all',
      sentAt: '2024-01-15T10:30:00',
      recipients: 156,
    },
    {
      id: '2',
      title: 'صيانة مجدولة',
      message: 'سيتم اجراء صيانة يوم الجمعة من 2-4 صباحا',
      type: 'all',
      sentAt: '2024-01-14T14:00:00',
      recipients: 156,
    },
    {
      id: '3',
      title: 'تنبيه امني',
      message: 'تم رصد محاولات دخول غير مصرح بها',
      type: 'critical',
      sentAt: '2024-01-13T09:15:00',
      recipients: 12,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الاشعارات</h1>
        <p className="text-white/60">ارسال اشعارات للمستخدمين والمؤسسات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">ارسال اشعار جديد</h2>

          <div className="space-y-4">
            <div>
              <label className="label">نوع الاشعار</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationType('all')}
                  className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-2 ${
                    notificationType === 'all'
                      ? 'bg-stc-gold/20 border-stc-gold text-stc-gold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>الجميع</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType('org')}
                  className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-2 ${
                    notificationType === 'org'
                      ? 'bg-stc-gold/20 border-stc-gold text-stc-gold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>مؤسسة محددة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType('critical')}
                  className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-2 ${
                    notificationType === 'critical'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span>طوارئ</span>
                </button>
              </div>
            </div>

            {notificationType === 'org' && (
              <div>
                <label className="label">اختر المؤسسة</label>
                <select className="input">
                  <option value="">اختر المؤسسة</option>
                  <option value="1">شركة التقنية الحديثة</option>
                  <option value="2">مؤسسة الابداع</option>
                  <option value="3">شركة المستقبل</option>
                </select>
              </div>
            )}

            <div>
              <label className="label">عنوان الاشعار</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="ادخل عنوان الاشعار"
              />
            </div>

            <div>
              <label className="label">نص الرسالة</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input min-h-[120px] resize-none"
                placeholder="اكتب نص الرسالة هنا..."
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!title || !message || sending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الارسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>ارسال الاشعار</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">الاشعارات السابقة</h2>

          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {notification.type === 'critical' ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : notification.type === 'org' ? (
                      <Building2 className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Bell className="w-5 h-5 text-stc-gold" />
                    )}
                    <h3 className="font-medium">{notification.title}</h3>
                  </div>
                  <span className="text-xs text-white/50">
                    {new Date(notification.sentAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <p className="text-sm text-white/60 mb-2">{notification.message}</p>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>
                    {notification.type === 'all' ? 'ارسل للجميع' :
                      notification.type === 'org' ? 'مؤسسة محددة' : 'طوارئ'}
                  </span>
                  <span>{notification.recipients} مستلم</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-6">احصائيات الاشعارات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-3xl font-bold text-stc-gold mb-1">1,234</p>
            <p className="text-sm text-white/60">اجمالي الاشعارات</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-3xl font-bold text-emerald-400 mb-1">98.5%</p>
            <p className="text-sm text-white/60">معدل التسليم</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-400 mb-1">45%</p>
            <p className="text-sm text-white/60">معدل القراءة</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-3xl font-bold text-orange-400 mb-1">23</p>
            <p className="text-sm text-white/60">اشعارات طوارئ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
