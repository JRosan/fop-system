import { create } from 'zustand';
import { apiClient } from '../services/api';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'DocumentsRequested'
  | 'Approved'
  | 'Rejected'
  | 'Withdrawn';

export type PermitType = 'OneTime' | 'Blanket' | 'Emergency';

export interface Application {
  id: string;
  referenceNumber: string;
  permitType: PermitType;
  status: ApplicationStatus;
  operatorName: string;
  operatorCountry: string;
  aircraftRegistration: string;
  aircraftType: string;
  flightPurpose: string;
  requestedStartDate: string;
  requestedEndDate: string;
  createdAt: string;
  submittedAt?: string;
  totalFee: number;
  currency: string;
}

export interface ApplicationDetails extends Application {
  operator: {
    id: string;
    name: string;
    country: string;
    aocNumber?: string;
    contactEmail: string;
    contactPhone?: string;
  };
  aircraft: {
    id: string;
    registration: string;
    type: string;
    manufacturer: string;
    model: string;
    maxTakeoffWeight: number;
    seatCapacity: number;
  };
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    uploadedAt: string;
  }>;
  timeline: Array<{
    action: string;
    date: string;
    user?: string;
    notes?: string;
  }>;
  reviewNotes?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Waived' | 'Refunded';
}

export interface ApplicationState {
  applications: Application[];
  currentApplication: ApplicationDetails | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchApplications: () => Promise<void>;
  fetchApplication: (id: string) => Promise<void>;
  createApplication: (data: CreateApplicationData) => Promise<string>;
  submitApplication: (id: string) => Promise<void>;
  withdrawApplication: (id: string) => Promise<void>;
  uploadDocument: (applicationId: string, file: DocumentUpload) => Promise<void>;
  clearCurrentApplication: () => void;
  clearError: () => void;
}

export interface CreateApplicationData {
  permitType: PermitType;
  operatorId: string;
  aircraftId: string;
  flightPurpose: string;
  requestedStartDate: string;
  requestedEndDate: string;
  flightDetails?: {
    departureAirport?: string;
    arrivalAirport?: string;
    estimatedFlights?: number;
  };
}

export interface DocumentUpload {
  uri: string;
  name: string;
  type: string;
  documentType: string;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Application[]>('/applications');
      set({ applications: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch applications';
      set({ error: message, isLoading: false });
    }
  },

  fetchApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ApplicationDetails>(`/applications/${id}`);
      set({ currentApplication: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch application';
      set({ error: message, isLoading: false });
    }
  },

  createApplication: async (data: CreateApplicationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ id: string }>('/applications', data);
      set({ isLoading: false });
      return response.data.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create application';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  submitApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/applications/${id}/submit`);
      // Refresh the current application
      const response = await apiClient.get<ApplicationDetails>(`/applications/${id}`);
      set({ currentApplication: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit application';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  withdrawApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/applications/${id}/withdraw`);
      // Refresh the current application
      const response = await apiClient.get<ApplicationDetails>(`/applications/${id}`);
      set({ currentApplication: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to withdraw application';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  uploadDocument: async (applicationId: string, file: DocumentUpload) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);
      formData.append('documentType', file.documentType);

      await apiClient.post(`/applications/${applicationId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh the current application
      const response = await apiClient.get<ApplicationDetails>(`/applications/${applicationId}`);
      set({ currentApplication: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearCurrentApplication: () => set({ currentApplication: null }),
  clearError: () => set({ error: null }),
}));
