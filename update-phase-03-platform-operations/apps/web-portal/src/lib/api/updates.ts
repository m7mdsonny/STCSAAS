import { apiClient } from '../apiClient';
import type { UpdatePackage } from '../../types/database';

export const updatesApi = {
  async list(): Promise<UpdatePackage[]> {
    const { data, error } = await apiClient.get<UpdatePackage[]>('/updates');
    if (error || !data) {
      throw new Error(error || 'Failed to load updates');
    }
    return data;
  },

  async create(payload: Partial<UpdatePackage>): Promise<UpdatePackage> {
    const { data, error } = await apiClient.post<UpdatePackage>('/updates', payload);
    if (error || !data) {
      throw new Error(error || 'Failed to create update');
    }
    return data;
  },

  async apply(id: string, status: string = 'applied'): Promise<UpdatePackage> {
    const { data, error } = await apiClient.post<UpdatePackage>(`/updates/${id}/apply`, { status });
    if (error || !data) {
      throw new Error(error || 'Failed to apply update');
    }
    return data;
  },
};
