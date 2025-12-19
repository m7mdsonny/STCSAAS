import { useEffect, useState } from 'react';
import { HardDrive, Download, RotateCcw, PlusCircle } from 'lucide-react';
import { backupsApi } from '../../lib/api/backups';
import type { SystemBackup } from '../../types/database';

export function AdminBackups() {
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await backupsApi.list();
      setBackups(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createBackup = async () => {
    setWorking(true);
    try {
      await backupsApi.create();
      load();
    } finally {
      setWorking(false);
    }
  };

  const restore = async (id: number) => {
    if (!confirm('استعادة النسخة الاحتياطية ستستبدل البيانات الحالية. هل انت متأكد؟')) return;
    setWorking(true);
    try {
      await backupsApi.restore(id);
      alert('تم بدء الاستعادة، راجع السجلات على الخادم.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
          <p className="text-white/60">انشاء، تحميل، واستعادة النسخ الاحتياطية</p>
        </div>
        <button onClick={createBackup} className="btn-primary flex items-center gap-2" disabled={working}>
          <PlusCircle className="w-4 h-4" />
          <span>نسخ الآن</span>
        </button>
      </div>

      <div className="card p-6">
        {loading ? (
          <p className="text-white/60">جاري التحميل...</p>
        ) : backups.length === 0 ? (
          <p className="text-white/60">لا توجد نسخ احتياطية بعد.</p>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-stc-gold" />
                  <div>
                    <p className="font-semibold">{backup.file_path}</p>
                    <p className="text-xs text-white/50">{backup.created_at}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={backup.file_path}
                    className="btn-secondary flex items-center gap-2"
                    download
                  >
                    <Download className="w-4 h-4" />
                    تحميل
                  </a>
                  <button
                    onClick={() => restore(backup.id)}
                    className="btn-secondary flex items-center gap-2"
                    disabled={working}
                  >
                    <RotateCcw className="w-4 h-4" />
                    استعادة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
