import { apiClient } from '../apiClient';

export interface PlatformContentItem {
  id?: string;
  key: string;
  value: string | null;
  section?: string | null;
}

export const contentApi = {
  async list(): Promise<PlatformContentItem[]> {
    const { data, error } = await apiClient.get<PlatformContentItem[]>('/content');
    if (error || !data) {
      throw new Error(error || 'Failed to load content');
    }
    return data;
  },

  async section(section: string): Promise<PlatformContentItem[]> {
    const { data, error } = await apiClient.get<PlatformContentItem[]>(`/content/${section}`);
    if (error || !data) {
      throw new Error(error || 'Failed to load section');
    }
    return data;
  },

  async update(items: PlatformContentItem[]): Promise<void> {
    const { error } = await apiClient.put('/content', { contents: items });
    if (error) {
      throw new Error(error);
    }
  },
};
