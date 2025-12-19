import { apiClient } from '../apiClient';
import type { SubscriptionPlan } from '../../types/database';

export const subscriptionPlansApi = {
  async list(): Promise<SubscriptionPlan[]> {
    const { data, error } = await apiClient.get<SubscriptionPlan[]>('/subscription-plans');
    if (error || !data) {
      throw new Error(error || 'Failed to load plans');
    }
    return data.map((plan) => ({
      ...plan,
      sms_quota_monthly: Array.isArray(plan.notification_channels)
        ? (plan.notification_channels.find((ch: any) => ch?.channel === 'sms') as any)?.monthly_quota
        : undefined,
    }));
  },

  async create(payload: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const { data, error } = await apiClient.post<SubscriptionPlan>('/subscription-plans', payload);
    if (error || !data) {
      throw new Error(error || 'Failed to create plan');
    }
    return data;
  },

  async update(id: string, payload: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const { data, error } = await apiClient.put<SubscriptionPlan>(`/subscription-plans/${id}`, payload);
    if (error || !data) {
      throw new Error(error || 'Failed to update plan');
    }
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await apiClient.delete(`/subscription-plans/${id}`);
    if (error) {
      throw new Error(error);
    }
  },
};
