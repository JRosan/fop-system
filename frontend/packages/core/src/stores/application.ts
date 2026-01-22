import { create } from 'zustand';
import type {
  ApplicationSummary,
  FopApplication,
  ApplicationFilter,
  PaginatedResponse,
} from '@fop/types';
import { applicationsApi } from '@fop/api';

interface ApplicationState {
  applications: ApplicationSummary[];
  currentApplication: FopApplication | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  filter: ApplicationFilter;

  // Actions
  fetchApplications: (filter?: ApplicationFilter) => Promise<void>;
  fetchApplication: (id: string) => Promise<void>;
  setFilter: (filter: Partial<ApplicationFilter>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  applications: [],
  currentApplication: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  filter: {},
};

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  ...initialState,

  fetchApplications: async (filter) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilter = { ...get().filter, ...filter };
      const response: PaginatedResponse<ApplicationSummary> =
        await applicationsApi.getAll(mergedFilter);

      set({
        applications: response.items,
        totalCount: response.totalCount,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        filter: mergedFilter,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch applications',
        isLoading: false,
      });
    }
  },

  fetchApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const application = await applicationsApi.getById(id);
      set({ currentApplication: application, isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch application',
        isLoading: false,
      });
    }
  },

  setFilter: (filter) => {
    set((state) => ({ filter: { ...state.filter, ...filter } }));
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
