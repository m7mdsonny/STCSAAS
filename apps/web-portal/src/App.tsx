import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Automation } from './pages/Automation';
import { Cameras } from './pages/Cameras';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { People } from './pages/People';
import { Vehicles } from './pages/Vehicles';
import { Attendance } from './pages/Attendance';
import { LiveView } from './pages/LiveView';
import { Settings } from './pages/Settings';
import { Team } from './pages/Team';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Organizations } from './pages/admin/Organizations';
import { Users } from './pages/admin/Users';
import { Licenses } from './pages/admin/Licenses';
import { Plans } from './pages/admin/Plans';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSettings } from './pages/admin/AdminSettings';
import { LandingSettingsPage } from './pages/admin/LandingSettings';
import { AdminIntegrations } from './pages/admin/AdminIntegrations';
import { AdminSmsSettings } from './pages/admin/AdminSmsSettings';
import { AdminUpdates } from './pages/admin/AdminUpdates';
import { AdminBackups } from './pages/admin/AdminBackups';
import { AiCommandCenter } from './pages/admin/AiCommandCenter';
import { EdgeServers } from './pages/admin/EdgeServers';
import { Resellers } from './pages/admin/Resellers';
import { SystemMonitor } from './pages/admin/SystemMonitor';
import { Loader2 } from 'lucide-react';
import { BrandingProvider } from './contexts/BrandingContext';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stc-bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stc-gold animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stc-bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stc-gold animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={isSuperAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        element={
          <PrivateRoute adminOnly>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/monitor" element={<SystemMonitor />} />
        <Route path="/admin/organizations" element={<Organizations />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/licenses" element={<Licenses />} />
        <Route path="/admin/edge-servers" element={<EdgeServers />} />
        <Route path="/admin/resellers" element={<Resellers />} />
        <Route path="/admin/plans" element={<Plans />} />
        <Route path="/admin/integrations" element={<AdminIntegrations />} />
        <Route path="/admin/sms" element={<AdminSmsSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/landing" element={<LandingSettingsPage />} />
        <Route path="/admin/updates" element={<AdminUpdates />} />
        <Route path="/admin/backups" element={<AdminBackups />} />
        <Route path="/admin/ai-commands" element={<AiCommandCenter />} />
      </Route>

      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live" element={<LiveView />} />
        <Route path="/cameras" element={<Cameras />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/people" element={<People />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BrandingProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrandingProvider>
    </BrowserRouter>
  );
}
