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
let tenantId: string | null = null;
let tenantCode: string | null = null;

// Default tenant code for development (BVI)
const DEFAULT_TENANT_CODE = 'BVI';

export function setAuthToken(token: string): void {
  authToken = token;
}

export function clearAuthToken(): void {
  authToken = null;
}

export function setTenantId(id: string): void {
  tenantId = id;
}

export function clearTenantId(): void {
  tenantId = null;
}

export function setTenantCode(code: string): void {
  tenantCode = code;
}

export function clearTenantCode(): void {
  tenantCode = null;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    } else if (tenantCode) {
      config.headers['X-Tenant-Code'] = tenantCode;
    } else {
      // Use default tenant code for development
      config.headers['X-Tenant-Code'] = DEFAULT_TENANT_CODE;
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
