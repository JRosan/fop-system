import { create } from 'zustand';
import { apiClient } from '../services/api';

export type AircraftCategory = 'FixedWing' | 'Rotorcraft' | 'Balloon' | 'Glider' | 'Airship';

export interface WeightDto {
  value: number;
  unit: string;
}

export interface Aircraft {
  id: string;
  registrationMark: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: AircraftCategory;
  mtow: WeightDto;
  seatCount: number;
  yearOfManufacture: number;
  noiseCategory?: string;
  operatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAircraftData {
  registrationMark: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: AircraftCategory;
  mtowValue: number;
  mtowUnit: 'Kilograms' | 'Pounds';
  seatCount: number;
  yearOfManufacture: number;
  operatorId: string;
  noiseCategory?: string;
}

export interface UpdateAircraftData {
  registrationMark?: string;
  mtowValue?: number;
  mtowUnit?: 'Kilograms' | 'Pounds';
  seatCount?: number;
  noiseCategory?: string;
}

export interface AircraftState {
  aircraft: Aircraft[];
  currentAircraft: Aircraft | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAircraft: (operatorId: string) => Promise<void>;
  fetchAircraftById: (id: string) => Promise<void>;
  createAircraft: (data: CreateAircraftData) => Promise<Aircraft>;
  updateAircraft: (id: string, data: UpdateAircraftData) => Promise<void>;
  clearCurrentAircraft: () => void;
  clearError: () => void;
}

export const useAircraftStore = create<AircraftState>((set) => ({
  aircraft: [],
  currentAircraft: null,
  isLoading: false,
  error: null,

  fetchAircraft: async (operatorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Aircraft[] | { items: Aircraft[] }>(`/aircraft/operator/${operatorId}`);
      // Handle both array and paginated response
      const items = Array.isArray(response.data) ? response.data : response.data.items || [];
      set({ aircraft: items, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch aircraft';
      set({ error: message, isLoading: false });
    }
  },

  fetchAircraftById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Aircraft>(`/aircraft/${id}`);
      set({ currentAircraft: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch aircraft';
      set({ error: message, isLoading: false });
    }
  },

  createAircraft: async (data: CreateAircraftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Aircraft>('/aircraft', data);
      set((state) => ({
        aircraft: [...state.aircraft, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create aircraft';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateAircraft: async (id: string, data: UpdateAircraftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<Aircraft>(`/aircraft/${id}`, data);
      set((state) => ({
        aircraft: state.aircraft.map((a) => (a.id === id ? response.data : a)),
        currentAircraft: state.currentAircraft?.id === id ? response.data : state.currentAircraft,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update aircraft';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearCurrentAircraft: () => set({ currentAircraft: null }),
  clearError: () => set({ error: null }),
}));
