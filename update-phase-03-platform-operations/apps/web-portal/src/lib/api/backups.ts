import { apiClient } from '../apiClient';

export interface SystemBackup {
  id: number;
  file_path: string;
  status: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export const backupsApi = {
  async list(): Promise<SystemBackup[]> {
    const { data, error } = await apiClient.get<SystemBackup[]>('/backups');
    if (error || !data) {
      throw new Error(error || 'Failed to load backups');
    }
    return data;
  },

  async create(): Promise<SystemBackup> {
    const { data, error } = await apiClient.post<SystemBackup>('/backups');
    if (error || !data) {
      throw new Error(error || 'Failed to start backup');
    }
    return data;
  },

  async restore(id: number): Promise<{ status: string }> {
    const { data, error } = await apiClient.post<{ status: string }>(`/backups/${id}/restore`);
    if (error || !data) {
      throw new Error(error || 'Failed to restore backup');
    }
    return data;
  },
};
