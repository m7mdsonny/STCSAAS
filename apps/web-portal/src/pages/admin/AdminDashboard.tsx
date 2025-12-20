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

// Chart data will be loaded from API when available
const mockChartData: { name: string; organizations: number; revenue: number }[] = [];
const planDistribution: { name: string; value: number; color: string }[] = [];

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
        totalOrganizations: data.total_organizations || 0,
        activeOrganizations: (data as any).active_organizations || data.total_organizations || 0,
        totalEdgeServers: data.total_edge_servers || 0,
        onlineServers: (data as any).online_edge_servers || 0,
        totalCameras: data.total_cameras || 0,
        todayAlerts: data.alerts_today || 0,
        monthlyRevenue: data.revenue_this_month || 0,
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
            <span className="text-sm text-white/40">قريباً - سيتم إضافة البيانات التاريخية</span>
          </div>
          <div className="h-72 flex items-center justify-center text-white/40">
            <p>البيانات التاريخية قيد التطوير</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">توزيع الباقات</h2>
          <div className="h-48 flex items-center justify-center text-white/40">
            <p>البيانات قيد التطوير</p>
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
            <p className="text-2xl font-bold">{loading ? '-' : `${stats.monthlyRevenue.toLocaleString()} ج.م`}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <span className="text-white/60">الشهر السابق</span>
            </div>
            <p className="text-2xl font-bold">{loading ? '-' : 'قريباً'}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="text-white/60">اجمالي السنة</span>
            </div>
            <p className="text-2xl font-bold">{loading ? '-' : 'قريباً'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
