import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Users, UserCheck, Server, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../lib/api/dashboard';
import { camerasApi } from '../lib/api/cameras';
import { edgeServersApi } from '../lib/api/edgeServers';
import { alertsApi } from '../lib/api/alerts';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/ui/StatCard';
import { EdgeServerStatus } from '../components/ui/EdgeServerStatus';
import { EdgeServerMonitor } from '../components/ui/EdgeServerMonitor';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { Alert, Camera as CameraType, EdgeServer } from '../types/database';

const weeklyData = [
  { day: 'السبت', alerts: 12, visitors: 145 },
  { day: 'الاحد', alerts: 8, visitors: 230 },
  { day: 'الاثنين', alerts: 15, visitors: 189 },
  { day: 'الثلاثاء', alerts: 5, visitors: 210 },
  { day: 'الاربعاء', alerts: 9, visitors: 178 },
  { day: 'الخميس', alerts: 3, visitors: 156 },
  { day: 'الجمعة', alerts: 2, visitors: 98 },
];

export function Dashboard() {
  const { organization } = useAuth();
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [servers, setServers] = useState<EdgeServer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      fetchData();
    }
  }, [organization]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [camerasRes, serversRes, alertsRes] = await Promise.all([
        camerasApi.getCameras({ per_page: 100 }),
        edgeServersApi.getEdgeServers({ per_page: 100 }),
        alertsApi.getAlerts({ per_page: 10 }),
      ]);

      setCameras(camerasRes.data || []);
      setServers(serversRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch {
    }
    setLoading(false);
  };

  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const newAlerts = alerts.filter(a => a.status === 'new').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">مرحبا، {organization?.name}</h1>
          <p className="page-subtitle">نظرة عامة على نظام المراقبة</p>
        </div>
        <Link to="/automation" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <Zap className="w-4 h-4" />
          <span>اوامر الذكاء الاصطناعي</span>
        </Link>
      </div>

      <div className="grid-stats">
        <StatCard
          title="الكاميرات المتصلة"
          value={loading ? '-' : `${onlineCameras}/${cameras.length}`}
          icon={Camera}
          color="green"
        />
        <StatCard
          title="التنبيهات الجديدة"
          value={loading ? '-' : newAlerts}
          icon={AlertTriangle}
          color={newAlerts > 0 ? 'red' : 'blue'}
        />
        <StatCard
          title="الزوار اليوم"
          value={loading ? '-' : 234}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="الحضور اليوم"
          value={loading ? '-' : 48}
          icon={UserCheck}
          color="blue"
        />
      </div>

      <EdgeServerMonitor />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">احصائيات الاسبوع</h2>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-white/60">التنبيهات</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-stc-gold" />
                <span className="text-white/60">الزوار</span>
              </div>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E6E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="visitors" fill="#DCA000" radius={[3, 3, 0, 0]} />
                <Bar dataKey="alerts" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">التنبيهات الاخيرة</h2>
            <Link to="/alerts" className="text-xs text-stc-gold hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-center text-white/50 py-6 text-sm">لا توجد تنبيهات</p>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-2.5 bg-white/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{alert.title}</p>
                      <p className="text-[10px] text-white/50">
                        {new Date(alert.created_at).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <span className={`badge text-[10px] px-2 py-0.5 ${
                      alert.status === 'new' ? 'badge-danger' :
                      alert.status === 'acknowledged' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {alert.status === 'new' ? 'جديد' :
                       alert.status === 'acknowledged' ? 'تم الاطلاع' : 'محلول'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EdgeServerStatus />

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">حالة السيرفرات</h2>
            <Link to="/settings" className="text-xs text-stc-gold hover:underline">
              الاعدادات
            </Link>
          </div>
          <div className="space-y-2">
            {servers.length === 0 ? (
              <p className="text-center text-white/50 py-6 text-sm">لا توجد سيرفرات</p>
            ) : (
              servers.map((server) => (
                <div key={server.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Server className={`w-4 h-4 ${server.status === 'online' ? 'text-emerald-500' : 'text-red-500'}`} />
                    <div>
                      <p className="font-medium text-sm">{server.name}</p>
                      <p className="text-[10px] text-white/50">{server.ip_address || 'غير محدد'}</p>
                    </div>
                  </div>
                  <span className={`badge text-[10px] px-2 py-0.5 ${server.status === 'online' ? 'badge-success' : 'badge-danger'}`}>
                    {server.status === 'online' ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">حالة الكاميرات</h2>
            <Link to="/cameras" className="text-xs text-stc-gold hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {cameras.length === 0 ? (
              <p className="col-span-2 text-center text-white/50 py-6 text-sm">لا توجد كاميرات</p>
            ) : (
              cameras.slice(0, 4).map((camera) => (
                <div key={camera.id} className="p-2.5 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      camera.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium text-xs truncate">{camera.name}</span>
                  </div>
                  <p className="text-[10px] text-white/50 truncate">{camera.location || 'غير محدد'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
