import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<void> | null = null;

function formatApiError(error: unknown): string {
  if (!error) return 'Noma\'lum xatolik';
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) return error.map(formatApiError).join(' ');
  if (typeof error === 'object') {
    return Object.entries(error)
      .map(([field, value]) => {
        const message = formatApiError(value);
        return field === 'non_field_errors' || field === 'detail' ? message : `${field}: ${message}`;
      })
      .join(' ');
  }
  return String(error);
}

async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('Refresh token topilmadi');
  const response = await apiClient.post<ApiResponse<{ access: string; refresh?: string }>>('/auth/token/refresh/', { refresh });
  if (response.data.data?.access) localStorage.setItem('access_token', response.data.data.access);
  if (response.data.data?.refresh) localStorage.setItem('refresh_token', response.data.data.refresh);
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshPromise = refreshPromise || refreshToken().finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

/**
 * Unwraps the standard API response envelope and throws typed errors.
 */
export async function apiRequest<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  if (!response.data.success || response.data.data === null) {
    throw new Error(formatApiError(response.data.error));
  }
  return response.data.data;
}
