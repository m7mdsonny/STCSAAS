import { useState, useEffect } from 'react';
import { Building2, Server, Camera, AlertTriangle, TrendingUp, CreditCard } from 'lucide-react';
import { dashboardApi } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalEdgeServers: number;
  onlineServers: number;
  totalCameras: number;
  todayAlerts: number;
  monthlyRevenue: number;
}

const mockChartData = [
  { name: 'يناير', organizations: 4, revenue: 8000 },
  { name: 'فبراير', organizations: 6, revenue: 12000 },
  { name: 'مارس', organizations: 8, revenue: 16000 },
  { name: 'ابريل', organizations: 12, revenue: 24000 },
  { name: 'مايو', organizations: 15, revenue: 32000 },
  { name: 'يونيو', organizations: 18, revenue: 40000 },
];

const planDistribution = [
  { name: 'اساسي', value: 45, color: '#3B82F6' },
  { name: 'احترافي', value: 35, color: '#DCA000' },
  { name: 'مؤسسي', value: 20, color: '#10B981' },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalEdgeServers: 0,
    onlineServers: 0,
    totalCameras: 0,
    todayAlerts: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardApi.getAdminDashboard();

      setStats({
        totalOrganizations: data.total_organizations,
        activeOrganizations: data.total_organizations, // API should provide active count
        totalEdgeServers: data.total_edge_servers,
        onlineServers: data.total_edge_servers, // API should provide online count
        totalCameras: data.total_cameras,
        todayAlerts: data.alerts_today,
        monthlyRevenue: data.revenue_this_month,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة تحكم المشرف</h1>
          <p className="text-white/60">نظرة عامة على النظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="اجمالي المؤسسات"
          value={loading ? '-' : `${stats.activeOrganizations}/${stats.totalOrganizations}`}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="الاجهزة المتصلة"
          value={loading ? '-' : `${stats.onlineServers}/${stats.totalEdgeServers}`}
          icon={Server}
          color="green"
        />
        <StatCard
          title="اجمالي الكاميرات"
          value={loading ? '-' : stats.totalCameras}
          icon={Camera}
          color="blue"
        />
        <StatCard
          title="تنبيهات اليوم"
          value={loading ? '-' : stats.todayAlerts}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">نمو المؤسسات والايرادات</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-stc-gold" />
                <span className="text-white/60">المؤسسات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-white/60">الايرادات</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E6E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="organizations"
                  stroke="#DCA000"
                  strokeWidth={2}
                  dot={{ fill: '#DCA000' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">توزيع الباقات</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E6E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-sm text-white/70">{plan.name}</span>
                </div>
                <span className="text-sm font-medium">{plan.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">الايرادات الشهرية</h2>
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">+23%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-stc-gold" />
              <span className="text-white/60">هذا الشهر</span>
            </div>
            <p className="text-2xl font-bold">42,500 ج.م</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <span className="text-white/60">الشهر السابق</span>
            </div>
            <p className="text-2xl font-bold">34,500 ج.م</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="text-white/60">اجمالي السنة</span>
            </div>
            <p className="text-2xl font-bold">380,000 ج.م</p>
          </div>
        </div>
      </div>
    </div>
  );
}
