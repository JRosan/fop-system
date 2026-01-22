import { apiClient } from '../client';
import type {
  FopApplication,
  ApplicationSummary,
  CreateApplicationRequest,
  ApplicationFilter,
  PaginatedResponse,
} from '@fop/types';

export const applicationsApi = {
  async getAll(filter?: ApplicationFilter): Promise<PaginatedResponse<ApplicationSummary>> {
    const { data } = await apiClient.get('/applications', { params: filter });
    return data;
  },

  async getById(id: string): Promise<FopApplication> {
    const { data } = await apiClient.get(`/applications/${id}`);
    return data;
  },

  async create(request: CreateApplicationRequest): Promise<FopApplication> {
    const { data } = await apiClient.post('/applications', request);
    return data;
  },

  async submit(id: string): Promise<void> {
    await apiClient.post(`/applications/${id}/submit`);
  },

  async approve(id: string, notes?: string): Promise<string> {
    const { data } = await apiClient.post(`/applications/${id}/approve`, { notes });
    return data;
  },

  async reject(id: string, reason: string): Promise<void> {
    await apiClient.post(`/applications/${id}/reject`, { reason });
  },

  async startReview(id: string): Promise<void> {
    await apiClient.post(`/applications/${id}/review`);
  },

  async flag(id: string, reason: string): Promise<void> {
    await apiClient.post(`/applications/${id}/flag`, { reason });
  },

  async unflag(id: string): Promise<void> {
    await apiClient.post(`/applications/${id}/unflag`);
  },

  async requestDocuments(id: string, documentTypes: string[], message?: string): Promise<void> {
    await apiClient.post(`/applications/${id}/request-documents`, { documentTypes, message });
  },

  async getPendingReview(filter?: ApplicationFilter): Promise<PaginatedResponse<ApplicationSummary>> {
    const { data } = await apiClient.get('/applications', {
      params: {
        ...filter,
        status: ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS'],
      },
    });
    return data;
  },
};
