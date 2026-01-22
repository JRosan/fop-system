import type { Money } from './common';

export type WaiverType =
  | 'Emergency'
  | 'Humanitarian'
  | 'Government'
  | 'Diplomatic'
  | 'Military'
  | 'Other';

export type WaiverStatus = 'Pending' | 'Approved' | 'Rejected';

export interface FeeWaiver {
  id: string;
  applicationId: string;
  type: WaiverType;
  status: WaiverStatus;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  waivedAmount?: Money;
  waiverPercentage?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface PendingWaiver {
  waiverId: string;
  applicationId: string;
  applicationNumber: string;
  operatorName: string;
  waiverType: WaiverType;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  currentFeeAmount: number;
  currency: string;
}

export interface RequestWaiverRequest {
  applicationId: string;
  waiverType: WaiverType;
  reason: string;
  requestedBy: string;
}

export interface ApproveWaiverRequest {
  applicationId: string;
  approvedBy: string;
  waiverPercentage: number;
}

export interface RejectWaiverRequest {
  applicationId: string;
  rejectedBy: string;
  reason: string;
}

export interface WaiverApprovalResult {
  waiverId: string;
  waivedAmount: Money;
  newTotalFee: Money;
}
