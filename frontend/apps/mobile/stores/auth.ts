import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { apiClient, setTokens, clearTokens } from '../services/api';

const storage = new MMKV();
const USER_KEY = 'user_data';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  companyName?: string;
  operatorId?: string;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      setTokens(accessToken, refreshToken);
      storage.set(USER_KEY, JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    } finally {
      clearTokens();
      storage.delete(USER_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/register', data);
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  loadUser: async () => {
    // First try to load from storage
    const storedUser = storage.getString(USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        set({ user, isAuthenticated: true });
      } catch {
        storage.delete(USER_KEY);
      }
    }

    // Then try to refresh from API
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/auth/me');
      const user = response.data;
      storage.set(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // If API fails, keep stored user if available
      const storedUser = storage.getString(USER_KEY);
      if (!storedUser) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch('/auth/profile', data);
      const user = response.data;
      storage.set(USER_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
