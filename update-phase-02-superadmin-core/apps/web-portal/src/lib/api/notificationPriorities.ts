import { apiClient } from '../apiClient';
import type { NotificationPriority } from '../../types/database';

interface PriorityPayload {
  organization_id?: string | null;
  notification_type: string;
  priority: string;
  is_critical?: boolean;
}

export const notificationPrioritiesApi = {
  async list(organizationId?: string): Promise<NotificationPriority[]> {
    const params = organizationId ? { organization_id: organizationId } : undefined;
    const { data, error } = await apiClient.get<NotificationPriority[]>('/notification-priorities', params as any);
    if (error || !data) {
      throw new Error(error || 'Failed to load notification priorities');
    }
    return data;
  },

  async create(payload: PriorityPayload): Promise<NotificationPriority> {
    const { data, error } = await apiClient.post<NotificationPriority>('/notification-priorities', payload);
    if (error || !data) {
      throw new Error(error || 'Failed to create notification priority');
    }
    return data;
  },

  async update(id: string, payload: Partial<PriorityPayload>): Promise<NotificationPriority> {
    const { data, error } = await apiClient.put<NotificationPriority>(`/notification-priorities/${id}`, payload);
    if (error || !data) {
      throw new Error(error || 'Failed to update notification priority');
    }
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await apiClient.delete(`/notification-priorities/${id}`);
    if (error) {
      throw new Error(error);
    }
  },
};
