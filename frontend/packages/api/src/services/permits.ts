import { apiClient } from '../client';
import type {
  Permit,
  PermitSummary,
  PermitVerification,
  PermitFilter,
  PaginatedResponse,
} from '@fop/types';

export const permitsApi = {
  async getAll(filter?: PermitFilter): Promise<PaginatedResponse<PermitSummary>> {
    const { data } = await apiClient.get('/permits', { params: filter });
    return data;
  },

  async getById(id: string): Promise<Permit> {
    const { data } = await apiClient.get(`/permits/${id}`);
    return data;
  },

  async getByNumber(permitNumber: string): Promise<Permit> {
    const { data } = await apiClient.get(`/permits/number/${permitNumber}`);
    return data;
  },

  async verify(permitNumber: string): Promise<PermitVerification> {
    const { data } = await apiClient.get(`/permits/verify/${permitNumber}`);
    return data;
  },

  async revoke(id: string, reason: string): Promise<void> {
    await apiClient.post(`/permits/${id}/revoke`, { reason });
  },

  async suspend(id: string, reason: string, suspendUntil?: string): Promise<void> {
    await apiClient.post(`/permits/${id}/suspend`, { reason, suspendUntil });
  },
};
