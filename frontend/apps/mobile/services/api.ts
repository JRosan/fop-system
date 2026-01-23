import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { storage } from './storage';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// API base URL - use environment variable or ngrok tunnel for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://2e1efac2f8fb.ngrok-free.app/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'X-Tenant-Code': 'BVI',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getString(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = storage.getString(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          setTokens(accessToken, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          clearTokens();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export function setTokens(accessToken: string, refreshToken?: string): void {
  storage.set(AUTH_TOKEN_KEY, accessToken);
  if (refreshToken) {
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getAccessToken(): string | undefined {
  return storage.getString(AUTH_TOKEN_KEY);
}

export function clearTokens(): void {
  storage.delete(AUTH_TOKEN_KEY);
  storage.delete(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!storage.getString(AUTH_TOKEN_KEY);
}

// Re-export API services with mobile-specific configuration
export * from '@fop/api';
