import { apiClient } from '../apiClient';
import type { User } from '../../types/database';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const normalizedCredentials = {
      ...credentials,
      email: credentials.email.trim().toLowerCase(),
    };

    const { data, error } = await apiClient.post<AuthResponse>('/auth/login', normalizedCredentials, {
      skipAuthRedirect: true,
    });
    if (error || !data) {
      throw new Error(error || 'Login failed');
    }
    apiClient.setToken(data.token);
    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data, error } = await apiClient.post<AuthResponse>('/auth/register', userData);
    if (error || !data) {
      throw new Error(error || 'Registration failed');
    }
    apiClient.setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', undefined, { skipAuthRedirect: true });
    apiClient.setToken(null);
    window.location.href = '/login';
  },

  async getCurrentUser(options?: { skipRedirect?: boolean }): Promise<User | null> {
    const { data, error } = await apiClient.get<User>('/auth/me', undefined, {
      skipAuthRedirect: options?.skipRedirect,
    });
    if (error || !data) {
      return null;
    }
    return data;
  },

  async authenticateWithToken(token: string): Promise<User> {
    apiClient.setToken(token);
    const user = await this.getCurrentUser({ skipRedirect: true });
    if (!user) {
      apiClient.setToken(null);
      throw new Error('Invalid or expired token');
    }
    return user;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const { data, error } = await apiClient.put<User>('/auth/profile', profileData);
    if (error || !data) {
      throw new Error(error || 'Failed to update profile');
    }
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { error } = await apiClient.put('/auth/password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    });
    if (error) {
      throw new Error(error);
    }
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },
};
