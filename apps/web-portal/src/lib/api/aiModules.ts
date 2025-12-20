import { apiClient } from '../apiClient';

export interface AiModule {
  id: number;
  module_key: string;
  name: string;
  description: string | null;
  category: string;
  is_enabled: boolean;
  is_premium: boolean;
  min_plan_level: number;
  config_schema: Record<string, unknown>;
  default_config: Record<string, unknown>;
  required_camera_type: string | null;
  min_fps: number;
  min_resolution: string;
  icon: string | null;
  display_order: number;
}

export interface AiModuleConfig {
  id: string;
  organization_id: number;
  module_id: number;
  is_enabled: boolean;
  is_licensed: boolean;
  config: Record<string, unknown>;
  confidence_threshold: number;
  alert_threshold: number;
  cooldown_seconds: number;
  schedule_enabled: boolean;
  schedule: Record<string, unknown>;
  module?: AiModule;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  max_cameras: number;
  max_edge_servers: number;
  max_users: number;
  max_storage_gb: number;
  event_retention_days: number;
  video_retention_days: number;
  features_enabled: string[];
  ai_modules_enabled: string[];
  price_monthly: number;
  price_yearly: number;
  currency: string;
  is_active: boolean;
  is_public: boolean;
  display_order: number;
}

export const aiModulesApi = {
  getModules: async (): Promise<AiModule[]> => {
    const { data, error } = await apiClient.get<AiModule[]>('/ai-modules');
    if (error || !data) {
      throw new Error(error || 'Failed to fetch AI modules');
    }
    return data;
  },

  getModule: async (id: number): Promise<AiModule> => {
    const { data, error } = await apiClient.get<AiModule>(`/ai-modules/${id}`);
    if (error || !data) {
      throw new Error(error || 'Failed to fetch AI module');
    }
    return data;
  },

  updateModule: async (id: number, data: Partial<AiModule>): Promise<AiModule> => {
    const { data: result, error } = await apiClient.put<AiModule>(`/ai-modules/${id}`, data);
    if (error || !result) {
      throw new Error(error || 'Failed to update AI module');
    }
    return result;
  },

  getOrganizationConfigs: async (): Promise<AiModuleConfig[]> => {
    const { data, error } = await apiClient.get<AiModuleConfig[]>('/ai-modules/configs');
    if (error || !data) {
      throw new Error(error || 'Failed to fetch organization AI module configs');
    }
    return data;
  },

  getOrganizationConfig: async (moduleId: number): Promise<AiModuleConfig | null> => {
    try {
      const { data, error } = await apiClient.get<AiModuleConfig>(`/ai-modules/configs/${moduleId}`);
      if (error || !data) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  updateOrganizationConfig: async (moduleId: number, data: Partial<AiModuleConfig>): Promise<AiModuleConfig> => {
    const { data: result, error } = await apiClient.put<AiModuleConfig>(`/ai-modules/configs/${moduleId}`, data);
    if (error || !result) {
      throw new Error(error || 'Failed to update organization AI module config');
    }
    return result;
  },

  enableModule: async (moduleId: number): Promise<AiModuleConfig> => {
    const { data, error } = await apiClient.post<AiModuleConfig>(`/ai-modules/configs/${moduleId}/enable`);
    if (error || !data) {
      throw new Error(error || 'Failed to enable AI module');
    }
    return data;
  },

  disableModule: async (moduleId: number): Promise<AiModuleConfig> => {
    const { data, error } = await apiClient.post<AiModuleConfig>(`/ai-modules/configs/${moduleId}/disable`);
    if (error || !data) {
      throw new Error(error || 'Failed to disable AI module');
    }
    return data;
  },
};

export const subscriptionPlansApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const { data, error } = await apiClient.get<SubscriptionPlan[]>('/subscription-plans');
    if (error || !data) {
      throw new Error(error || 'Failed to fetch subscription plans');
    }
    return data;
  },

  getPlan: async (id: number): Promise<SubscriptionPlan> => {
    const { data, error } = await apiClient.get<SubscriptionPlan>(`/subscription-plans/${id}`);
    if (error || !data) {
      throw new Error(error || 'Failed to fetch subscription plan');
    }
    return data;
  },

  createPlan: async (data: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> => {
    const { data: result, error } = await apiClient.post<SubscriptionPlan>('/subscription-plans', data);
    if (error || !result) {
      throw new Error(error || 'Failed to create subscription plan');
    }
    return result;
  },

  updatePlan: async (id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const { data: result, error } = await apiClient.put<SubscriptionPlan>(`/subscription-plans/${id}`, data);
    if (error || !result) {
      throw new Error(error || 'Failed to update subscription plan');
    }
    return result;
  },

  deletePlan: async (id: number): Promise<void> => {
    const { error } = await apiClient.delete(`/subscription-plans/${id}`);
    if (error) {
      throw new Error(error || 'Failed to delete subscription plan');
    }
  },
};
