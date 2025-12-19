import { apiClient } from '../apiClient';
import type { BackupRecord } from '../../types/database';

export const backupsApi = {
  async list(): Promise<BackupRecord[]> {
    const { data, error } = await apiClient.get<BackupRecord[]>('/backups');
    if (error || !data) {
      throw new Error(error || 'Failed to load backups');
    }
    return data;
  },

  async create(tables?: string[]): Promise<BackupRecord> {
    const { data, error } = await apiClient.post<BackupRecord>('/backups', tables?.length ? { tables } : {});
    if (error || !data) {
      throw new Error(error || 'Failed to create backup');
    }
    return data;
  },

  async upload(file: File, meta?: Record<string, unknown>): Promise<BackupRecord> {
    const formData = new FormData();
    formData.append('backup', file);
    if (meta) {
      formData.append('meta', JSON.stringify(meta));
    }
    const { data, error } = await apiClient.post<BackupRecord>('/backups', formData);
    if (error || !data) {
      throw new Error(error || 'Failed to upload backup');
    }
    return data;
  },

  async restore(id: string): Promise<void> {
    const { error } = await apiClient.post(`/backups/${id}/restore`, { confirm: true });
    if (error) {
      throw new Error(error);
    }
  },

  downloadUrl(id: string): string {
    const base = (import.meta.env.VITE_API_URL || 'https://stcsolutions.online/api/v1').replace(/\/$/, '');
    return `${base}/backups/${id}/download`;
  },
};
