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
  async getSystemSettings(): Promise<SystemSettings> {
    const { data, error } = await apiClient.get<SystemSettings>('/super-admin/settings');
    if (error || !data) {
      throw new Error(error || 'Failed to fetch system settings');
    }
    return data;
  },

  async updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const { data: responseData, error } = await apiClient.put<SystemSettings>('/super-admin/settings', data);
    if (error || !responseData) {
      throw new Error(error || 'Failed to update system settings');
    }
    return responseData;
  },

  async getPlatformBranding(): Promise<PlatformBranding> {
    const { data, error } = await apiClient.get<PlatformBranding>('/super-admin/branding');
    if (error || !data) {
      throw new Error(error || 'Failed to fetch platform branding');
    }
    return data;
  },

  async updatePlatformBranding(data: Partial<PlatformBranding>): Promise<PlatformBranding> {
    const { data: responseData, error } = await apiClient.put<PlatformBranding>('/super-admin/branding', data);
    if (error || !responseData) {
      throw new Error(error || 'Failed to update platform branding');
    }
    return responseData;
  },

  async uploadBrandingAsset(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const { data, error } = await apiClient.post<{ url: string }>('/settings/upload-logo', formData);
    if (error || !data) {
      throw new Error(error || 'Failed to upload asset');
    }
    return data;
  },

  async getSuperAdmins(): Promise<SuperAdmin[]> {
    const { data, error } = await apiClient.get<SuperAdmin[]>('/super-admin/admins');
    if (error || !data) {
      throw new Error(error || 'Failed to fetch super admins');
    }
    return Array.isArray(data) ? data : [];
  },

  async addSuperAdmin(userId: number): Promise<SuperAdmin> {
    const { data, error } = await apiClient.post<SuperAdmin>('/super-admin/admins', { user_id: userId });
    if (error || !data) {
      throw new Error(error || 'Failed to add super admin');
    }
    return data;
  },

  async removeSuperAdmin(id: string): Promise<void> {
    const { error } = await apiClient.delete(`/super-admin/admins/${id}`);
    if (error) {
      throw new Error(error || 'Failed to remove super admin');
    }
  },

  async checkIsSuperAdmin(): Promise<boolean> {
    try {
      const { data, error } = await apiClient.get<{ is_super_admin?: boolean }>('/super-admin/check');
      if (error || !data) {
        return false;
      }
      return data.is_super_admin ?? false;
    } catch {
      return false;
    }
  },
};
