import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TenantBranding } from '@fop/types';
import { setTenantId, clearTenantId } from '@fop/api';

interface TenantState {
  tenant: TenantBranding | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTenant: (tenant: TenantBranding) => void;
  clearTenant: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenant: null,
      isLoading: true,
      error: null,

      setTenant: (tenant) => {
        setTenantId(tenant.id);
        set({
          tenant,
          isLoading: false,
          error: null,
        });
      },

      clearTenant: () => {
        clearTenantId();
        set({
          tenant: null,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'fop-tenant-storage',
      partialize: (state) => ({
        tenant: state.tenant,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.tenant) {
          setTenantId(state.tenant.id);
        }
      },
    }
  )
);
