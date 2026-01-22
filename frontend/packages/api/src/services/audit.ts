import { apiClient } from '../client';
import type { AuditLog, AuditLogFilter, EntityType, PaginatedResponse } from '@fop/types';

export const auditApi = {
  async getAll(filter?: AuditLogFilter): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await apiClient.get('/audit', { params: filter });
    return data;
  },

  async getEntityHistory(entityType: EntityType, entityId: string): Promise<AuditLog[]> {
    const { data } = await apiClient.get(`/audit/${entityType}/${entityId}`);
    return data;
  },
};

export const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'Application', label: 'Applications' },
  { value: 'Operator', label: 'Operators' },
  { value: 'Aircraft', label: 'Aircraft' },
  { value: 'Document', label: 'Documents' },
  { value: 'Payment', label: 'Payments' },
  { value: 'Permit', label: 'Permits' },
  { value: 'User', label: 'Users' },
  { value: 'FeeWaiver', label: 'Fee Waivers' },
];

export const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  Created: { label: 'Created', color: 'bg-success-100 text-success-700' },
  Updated: { label: 'Updated', color: 'bg-blue-100 text-blue-700' },
  Deleted: { label: 'Deleted', color: 'bg-error-100 text-error-700' },
  Submitted: { label: 'Submitted', color: 'bg-primary-100 text-primary-700' },
  Approved: { label: 'Approved', color: 'bg-success-100 text-success-700' },
  Rejected: { label: 'Rejected', color: 'bg-error-100 text-error-700' },
  PaymentProcessed: { label: 'Payment Processed', color: 'bg-success-100 text-success-700' },
  PaymentRefunded: { label: 'Payment Refunded', color: 'bg-orange-100 text-orange-700' },
  DocumentUploaded: { label: 'Document Uploaded', color: 'bg-blue-100 text-blue-700' },
  DocumentVerified: { label: 'Document Verified', color: 'bg-success-100 text-success-700' },
  DocumentRejected: { label: 'Document Rejected', color: 'bg-error-100 text-error-700' },
  PermitIssued: { label: 'Permit Issued', color: 'bg-success-100 text-success-700' },
  PermitRevoked: { label: 'Permit Revoked', color: 'bg-error-100 text-error-700' },
  PermitSuspended: { label: 'Permit Suspended', color: 'bg-warning-100 text-warning-700' },
  WaiverRequested: { label: 'Waiver Requested', color: 'bg-yellow-100 text-yellow-700' },
  WaiverApproved: { label: 'Waiver Approved', color: 'bg-success-100 text-success-700' },
  WaiverRejected: { label: 'Waiver Rejected', color: 'bg-error-100 text-error-700' },
  FeeOverridden: { label: 'Fee Overridden', color: 'bg-purple-100 text-purple-700' },
  UserActivated: { label: 'User Activated', color: 'bg-success-100 text-success-700' },
  UserDeactivated: { label: 'User Deactivated', color: 'bg-neutral-100 text-neutral-700' },
  Login: { label: 'Login', color: 'bg-blue-100 text-blue-700' },
};
