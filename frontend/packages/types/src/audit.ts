export type AuditAction =
  | 'Created'
  | 'Updated'
  | 'Deleted'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'PaymentProcessed'
  | 'PaymentRefunded'
  | 'DocumentUploaded'
  | 'DocumentVerified'
  | 'DocumentRejected'
  | 'PermitIssued'
  | 'PermitRevoked'
  | 'PermitSuspended'
  | 'WaiverRequested'
  | 'WaiverApproved'
  | 'WaiverRejected'
  | 'FeeOverridden'
  | 'UserActivated'
  | 'UserDeactivated'
  | 'Login';

export type EntityType =
  | 'Application'
  | 'Operator'
  | 'Aircraft'
  | 'Document'
  | 'Payment'
  | 'Permit'
  | 'User'
  | 'FeeWaiver';

export interface AuditLog {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  oldValues?: string;
  newValues?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilter {
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AuditLogSummary {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  userEmail?: string;
  createdAt: string;
}
