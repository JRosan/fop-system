import { apiClient } from '../client';
import type {
  FeeWaiver,
  PendingWaiver,
  RequestWaiverRequest,
  ApproveWaiverRequest,
  RejectWaiverRequest,
  WaiverApprovalResult,
  WaiverType,
} from '@fop/types';

export const waiversApi = {
  async request(request: RequestWaiverRequest): Promise<FeeWaiver> {
    const { data } = await apiClient.post('/waivers/request', request);
    return data;
  },

  async approve(waiverId: string, request: ApproveWaiverRequest): Promise<WaiverApprovalResult> {
    const { data } = await apiClient.post(`/waivers/${waiverId}/approve`, request);
    return data;
  },

  async reject(waiverId: string, request: RejectWaiverRequest): Promise<void> {
    await apiClient.post(`/waivers/${waiverId}/reject`, request);
  },

  async getByApplication(applicationId: string): Promise<FeeWaiver[]> {
    const { data } = await apiClient.get(`/waivers/application/${applicationId}`);
    return data;
  },

  async getPending(): Promise<PendingWaiver[]> {
    const { data } = await apiClient.get('/waivers/pending');
    return data;
  },
};

export const WAIVER_TYPES: { value: WaiverType; label: string; description: string }[] = [
  {
    value: 'Emergency',
    label: 'Emergency',
    description: 'Life-threatening medical emergency or disaster response',
  },
  {
    value: 'Humanitarian',
    label: 'Humanitarian',
    description: 'Aid delivery, refugee assistance, or charitable operations',
  },
  {
    value: 'Government',
    label: 'Government',
    description: 'Official government operations or state aircraft',
  },
  {
    value: 'Diplomatic',
    label: 'Diplomatic',
    description: 'Diplomatic missions or official state visits',
  },
  {
    value: 'Military',
    label: 'Military',
    description: 'Military operations or training exercises',
  },
  {
    value: 'Other',
    label: 'Other',
    description: 'Other qualifying circumstances',
  },
];
