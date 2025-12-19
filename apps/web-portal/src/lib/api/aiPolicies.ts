import { apiClient } from '../apiClient';

export interface EffectivePolicy {
  id?: string | number;
  name?: string;
  scope?: string;
  status?: string;
  [key: string]: unknown;
}

export interface EffectivePolicyResponse {
  data?: EffectivePolicy[] | EffectivePolicy;
  [key: string]: unknown;
}

export const aiPoliciesApi = {
  async getEffective(): Promise<EffectivePolicyResponse> {
    const { data, error } = await apiClient.get<EffectivePolicyResponse>('/ai-policies/effective');
    if (error || !data) {
      throw new Error(error || 'Unable to load effective AI policies');
    }
    return data;
  },
};
