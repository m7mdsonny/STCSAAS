import { apiClient } from '../apiClient';
import type { SMSQuota } from '../../types/database';

export const smsQuotaApi = {
  async get(organizationId: string): Promise<SMSQuota> {
    const { data, error } = await apiClient.get<SMSQuota>(`/organizations/${organizationId}/sms-quota`);
    if (error || !data) {
      throw new Error(error || 'Failed to load SMS quota');
    }
    return data;
  },

  async update(organizationId: string, payload: Partial<SMSQuota>): Promise<SMSQuota> {
    const { data, error } = await apiClient.put<SMSQuota>(`/organizations/${organizationId}/sms-quota`, payload);
    if (error || !data) {
      throw new Error(error || 'Failed to update SMS quota');
    }
    return data;
  },
};
