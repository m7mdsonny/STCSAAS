import { apiClient } from '../apiClient';
import type { PlatformBranding } from '../../types/database';

export const brandingApi = {
  async getGlobal(): Promise<PlatformBranding> {
    const { data, error } = await apiClient.get<PlatformBranding>('/super-admin/branding');
    if (error || !data) {
      throw new Error(error || 'Failed to load branding');
    }
    return data;
  },

  async updateGlobal(payload: Partial<PlatformBranding>): Promise<PlatformBranding> {
    const { data, error } = await apiClient.put<PlatformBranding>('/super-admin/branding', payload);
    if (error || !data) {
      throw new Error(error || 'Failed to update branding');
    }
    return data;
  },
};
