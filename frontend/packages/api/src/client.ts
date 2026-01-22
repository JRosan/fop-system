import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export function setAuthToken(token: string): void {
  authToken = token;
}

export function clearAuthToken(): void {
  authToken = null;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      // Could emit an event or call a callback here for auth handling
    }

    const apiError = {
      status: error.response?.status || 500,
      message: (error.response?.data as { message?: string })?.message || error.message || 'An error occurred',
      errors: (error.response?.data as { errors?: Record<string, string[]> })?.errors,
    };

    return Promise.reject(apiError);
  }
);

export type ApiError = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};
