import type { Money } from './common';
import type { ApplicationType } from './application';

export type PermitStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export interface Permit {
  id: string;
  permitNumber: string;
  applicationId: string;
  applicationNumber: string;
  type: ApplicationType;
  status: PermitStatus;
  operatorId: string;
  operatorName: string;
  aircraftId: string;
  aircraftRegistration: string;
  validFrom: string;
  validUntil: string;
  issuedAt: string;
  issuedBy: string;
  conditions?: string[];
  feesPaid: Money;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermitSummary {
  id: string;
  permitNumber: string;
  type: ApplicationType;
  status: PermitStatus;
  operatorName: string;
  aircraftRegistration: string;
  validFrom: string;
  validUntil: string;
  issuedAt: string;
}

export interface PermitVerification {
  isValid: boolean;
  permit?: Permit;
  message: string;
}

export interface PermitFilter {
  status?: PermitStatus[];
  type?: ApplicationType[];
  operatorId?: string;
  issuedDateFrom?: string;
  issuedDateTo?: string;
  expiringWithinDays?: number;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface RevokePermitRequest {
  permitId: string;
  reason: string;
}

export interface SuspendPermitRequest {
  permitId: string;
  reason: string;
  suspendUntil?: string;
}
