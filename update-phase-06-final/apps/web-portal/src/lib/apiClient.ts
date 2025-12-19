const DEFAULT_API_URL = 'https://stcsolutions.online/api/v1';
const API_BASE_URL = ((import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API_URL).replace(/\/$/, '');

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

type RequestOptions = RequestInit & {
  skipAuthRedirect?: boolean;
  skipAuthHeader?: boolean;
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private resolveEndpoint(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    const normalizedEndpoint = endpoint.startsWith('/api/')
      ? endpoint
      : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (this.baseUrl.endsWith('/api/v1') && normalizedEndpoint.startsWith('/api/v1')) {
      return `${this.baseUrl}${normalizedEndpoint.replace('/api/v1', '')}`;
    }

    return `${this.baseUrl}${normalizedEndpoint}`;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { skipAuthRedirect, skipAuthHeader, ...fetchOptions } = options;
    const isFormData = fetchOptions.body instanceof FormData;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      ...(!isFormData && fetchOptions.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...fetchOptions.headers,
    };

    const activeToken = skipAuthHeader ? null : this.getToken();
    if (activeToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const response = await fetch(this.resolveEndpoint(endpoint), {
        ...fetchOptions,
        headers,
      });

      const responseText = await response.text();
      let data: unknown = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = responseText;
        }
      }

      if (!response.ok) {
        if (response.status === 401 && activeToken) {
          this.setToken(null);
        }

        const message = typeof data === 'object' && data !== null && 'message' in data
          ? (data as { message?: string }).message
          : undefined;

        return { error: message || 'An error occurred', status: response.status };
      }

      return { data: data as T, status: response.status };
    } catch (error) {
      return { error: (error as Error).message || 'Network error' };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const preparedBody = body instanceof FormData
      ? body
      : body !== undefined
        ? (typeof body === 'string' ? body : JSON.stringify(body))
        : undefined;

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: preparedBody,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const preparedBody = body instanceof FormData
      ? body
      : body !== undefined
        ? (typeof body === 'string' ? body : JSON.stringify(body))
        : undefined;

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: preparedBody,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
