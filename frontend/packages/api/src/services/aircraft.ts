import { apiClient } from '../client';
import type {
  Aircraft,
  AircraftSummary,
  CreateAircraftRequest,
  UpdateAircraftRequest,
  AircraftFilter,
  PaginatedResponse,
} from '@fop/types';

export const aircraftApi = {
  async getAll(filter?: AircraftFilter): Promise<PaginatedResponse<AircraftSummary>> {
    const { data } = await apiClient.get('/aircraft', { params: filter });
    return data;
  },

  async getById(id: string): Promise<Aircraft> {
    const { data } = await apiClient.get(`/aircraft/${id}`);
    return data;
  },

  async getByOperator(operatorId: string): Promise<AircraftSummary[]> {
    const { data } = await apiClient.get(`/aircraft/operator/${operatorId}`);
    return data;
  },

  async create(request: CreateAircraftRequest): Promise<Aircraft> {
    const { data } = await apiClient.post('/aircraft', request);
    return data;
  },

  async update(id: string, request: UpdateAircraftRequest): Promise<Aircraft> {
    const { data } = await apiClient.put(`/aircraft/${id}`, request);
    return data;
  },
};
