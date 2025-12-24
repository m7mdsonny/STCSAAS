import { apiClient } from '../apiClient';

export interface UpdateManifest {
  version: string;
  version_type: 'major' | 'minor' | 'patch' | 'hotfix';
  title: string;
  description?: string;
  release_notes?: string;
  changelog?: string;
  requires_version?: string;
  files?: Record<string, string>; // source => destination
  affected_modules?: string[];
  requires_manual_update?: boolean;
}

export interface SystemUpdate {
  id: string;
  path: string;
  manifest: UpdateManifest;
  installed: boolean;
}

export interface SystemUpdateResponse {
  current_version: string;
  updates: SystemUpdate[];
}

export const systemUpdatesApi = {
  async getUpdates(): Promise<SystemUpdateResponse> {
    const { data, error } = await apiClient.get<SystemUpdateResponse>('/system-updates');
    if (error || !data) {
      throw new Error(error || 'Failed to fetch updates');
    }
    return data;
  },

  async getCurrentVersion(): Promise<string> {
    const { data, error } = await apiClient.get<{ version: string }>('/system-updates/current-version');
    if (error || !data) {
      throw new Error(error || 'Failed to get current version');
    }
    return data.version;
  },

  async uploadPackage(file: File): Promise<{ update_id: string; version: string; manifest: UpdateManifest }> {
    const formData = new FormData();
    formData.append('package', file);
    
    const { data, error } = await apiClient.post<{ data: { update_id: string; version: string; manifest: UpdateManifest } }>(
      '/system-updates/upload',
      formData
    );
    
    if (error || !data) {
      throw new Error(error || 'Failed to upload update package');
    }
    
    return data.data;
  },

  async installUpdate(updateId: string): Promise<void> {
    const { error } = await apiClient.post(`/system-updates/${updateId}/install`);
    if (error) {
      throw new Error(error);
    }
  },

  async rollback(backupId: string): Promise<void> {
    const { error } = await apiClient.post(`/system-updates/rollback/${backupId}`);
    if (error) {
      throw new Error(error);
    }
  },
};

