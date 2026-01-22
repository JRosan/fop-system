import { apiClient } from '../client';
import type {
  Operator,
  OperatorSummary,
  CreateOperatorRequest,
  UpdateOperatorRequest,
  OperatorFilter,
  PaginatedResponse,
} from '@fop/types';

export const operatorsApi = {
  async getAll(filter?: OperatorFilter): Promise<PaginatedResponse<OperatorSummary>> {
    const { data } = await apiClient.get('/operators', { params: filter });
    return data;
  },

  async getById(id: string): Promise<Operator> {
    const { data } = await apiClient.get(`/operators/${id}`);
    return data;
  },

  async create(request: CreateOperatorRequest): Promise<Operator> {
    const { data } = await apiClient.post('/operators', request);
    return data;
  },

  async update(id: string, request: UpdateOperatorRequest): Promise<Operator> {
    const { data } = await apiClient.put(`/operators/${id}`, request);
    return data;
  },
};
