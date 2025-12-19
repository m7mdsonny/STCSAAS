import { apiClient, type PaginatedResponse } from '../apiClient';
import type { AICommand, AICommandLog, AICommandTarget } from '../../types/database';

interface CreateCommandPayload {
  title: string;
  command_type: string;
  payload?: Record<string, unknown>;
  is_template?: boolean;
  organization_id?: string | null;
  targets?: Array<{
    organization_id?: string | null;
    edge_server_id?: string | null;
    camera_group?: string | null;
  }>;
}

export const aiCommandsApi = {
  async list(filters: Record<string, string | number | boolean> = {}): Promise<PaginatedResponse<AICommand>> {
    const { data, error } = await apiClient.get<PaginatedResponse<AICommand>>('/ai-commands', filters as any);
    if (error || !data) {
      throw new Error(error || 'Failed to load commands');
    }
    return data;
  },

  async create(payload: CreateCommandPayload): Promise<AICommand> {
    const { data, error } = await apiClient.post<AICommand>('/ai-commands', payload);
    if (error || !data) {
      throw new Error(error || 'Failed to create command');
    }
    return data;
  },

  async updateStatus(id: string, status: string, message?: string): Promise<AICommand> {
    const { data, error } = await apiClient.post<AICommand>(`/ai-commands/${id}/status`, { status, message });
    if (error || !data) {
      throw new Error(error || 'Failed to update status');
    }
    return data;
  },

  async ack(id: string, targetId?: string): Promise<AICommand> {
    const { data, error } = await apiClient.post<AICommand>(`/ai-commands/${id}/ack`, {
      target_id: targetId,
    });
    if (error || !data) {
      throw new Error(error || 'Failed to acknowledge');
    }
    return data;
  },
};
