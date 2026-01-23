import { create } from 'zustand';
import { apiClient } from '../services/api';

export type PermitStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export type PermitType = 'OneTime' | 'Blanket' | 'Emergency';

export interface Permit {
  id: string;
  permitNumber: string;
  applicationId: string;
  applicationNumber: string;
  type: PermitType;
  status: PermitStatus;
  operatorId: string;
  operatorName: string;
  aircraftId: string;
  aircraftRegistration: string;
  validFrom: string;
  validUntil: string;
  issuedAt: string;
  issuedBy: string;
  conditions?: string[];
  feesPaid: {
    amount: number;
    currency: string;
  };
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermitSummary {
  id: string;
  permitNumber: string;
  type: PermitType;
  status: PermitStatus;
  operatorName: string;
  aircraftRegistration: string;
  validFrom: string;
  validUntil: string;
  issuedAt: string;
}

export interface PermitState {
  permits: PermitSummary[];
  expiringSoon: PermitSummary[];
  currentPermit: Permit | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPermits: (status?: PermitStatus[]) => Promise<void>;
  fetchPermit: (id: string) => Promise<void>;
  fetchExpiringSoon: (days?: number) => Promise<void>;
  clearCurrentPermit: () => void;
  clearError: () => void;
}

export const usePermitStore = create<PermitState>((set) => ({
  permits: [],
  expiringSoon: [],
  currentPermit: null,
  isLoading: false,
  error: null,

  fetchPermits: async (status?: PermitStatus[]) => {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, unknown> = {};
      if (status && status.length > 0) {
        params.status = status;
      }
      const response = await apiClient.get<{ items: PermitSummary[]; totalCount: number }>('/permits', { params });
      // Handle both array and paginated response
      const items = Array.isArray(response.data) ? response.data : response.data.items || [];
      set({ permits: items, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch permits';
      set({ error: message, isLoading: false });
    }
  },

  fetchPermit: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Permit>(`/permits/${id}`);
      set({ currentPermit: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch permit';
      set({ error: message, isLoading: false });
    }
  },

  fetchExpiringSoon: async (days: number = 30) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ items: PermitSummary[] } | PermitSummary[]>('/permits', {
        params: { expiringWithinDays: days, status: ['active'] },
      });
      const items = Array.isArray(response.data) ? response.data : response.data.items || [];
      set({ expiringSoon: items, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch expiring permits';
      set({ error: message, isLoading: false });
    }
  },

  clearCurrentPermit: () => set({ currentPermit: null }),
  clearError: () => set({ error: null }),
}));
