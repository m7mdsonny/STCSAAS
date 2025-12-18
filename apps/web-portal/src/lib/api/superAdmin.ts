import { apiClient } from '../apiClient';

export interface SystemSettings {
  id: string;
  platform_name: string;
  platform_tagline: string;
  support_email: string;
  support_phone: string | null;
  default_timezone: string;
  default_language: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  session_timeout_minutes: number;
  max_login_attempts: number;
  password_min_length: number;
  require_2fa: boolean;
  allow_registration: boolean;
  require_email_verification: boolean;
}

export interface PlatformBranding {
  id: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  danger_color: string;
  warning_color: string;
  success_color: string;
  font_family: string;
  heading_font: string;
  border_radius: string;
  custom_css: string | null;
}

export interface SuperAdmin {
  id: string;
  user_id: number;
  permissions: Record<string, boolean>;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const superAdminApi = {
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get('/api/v1/super-admin/settings');
    return response.data;
  },

  updateSystemSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await apiClient.put('/api/v1/super-admin/settings', data);
    return response.data;
  },

  getPlatformBranding: async (): Promise<PlatformBranding> => {
    const response = await apiClient.get('/api/v1/super-admin/branding');
    return response.data;
  },

  updatePlatformBranding: async (data: Partial<PlatformBranding>): Promise<PlatformBranding> => {
    const response = await apiClient.put('/api/v1/super-admin/branding', data);
    return response.data;
  },

  getSuperAdmins: async (): Promise<SuperAdmin[]> => {
    const response = await apiClient.get('/api/v1/super-admin/admins');
    return response.data;
  },

  addSuperAdmin: async (userId: number): Promise<SuperAdmin> => {
    const response = await apiClient.post('/api/v1/super-admin/admins', { user_id: userId });
    return response.data;
  },

  removeSuperAdmin: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/super-admin/admins/${id}`);
  },

  checkIsSuperAdmin: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/api/v1/super-admin/check');
      return response.data.is_super_admin;
    } catch {
      return false;
    }
  },
};
