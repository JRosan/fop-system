import type { Money, DateRange } from './common';
import type { Operator } from './operator';
import type { Aircraft } from './aircraft';
import type { Document } from './document';
import type { Payment } from './payment';

export type ApplicationType = 'ONE_TIME' | 'BLANKET' | 'EMERGENCY';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_DOCUMENTS'
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type FlightPurpose =
  | 'CHARTER'
  | 'CARGO'
  | 'TECHNICAL_LANDING'
  | 'MEDEVAC'
  | 'PRIVATE'
  | 'OTHER';

export interface FlightDetails {
  purpose: FlightPurpose;
  purposeDescription?: string;
  arrivalAirport: string;
  departureAirport: string;
  estimatedFlightDate: string;
  numberOfPassengers?: number;
  cargoDescription?: string;
}

export interface FopApplication {
  id: string;
  applicationNumber: string;
  type: ApplicationType;
  status: ApplicationStatus;
  operator: Operator;
  aircraft: Aircraft;
  flightDetails: FlightDetails;
  requestedPeriod: DateRange;
  documents: Document[];
  payment?: Payment;
  calculatedFee: Money;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationSummary {
  id: string;
  applicationNumber: string;
  type: ApplicationType;
  status: ApplicationStatus;
  operatorName: string;
  aircraftRegistration: string;
  calculatedFee: Money;
  submittedAt?: string;
  createdAt: string;
}

export interface CreateApplicationRequest {
  type: ApplicationType;
  operatorId?: string;
  operator?: Omit<Operator, 'id' | 'createdAt' | 'updatedAt'>;
  aircraftId?: string;
  aircraft?: Omit<Aircraft, 'id' | 'createdAt' | 'updatedAt'>;
  flightDetails: FlightDetails;
  requestedPeriod: DateRange;
}

export interface UpdateApplicationRequest {
  operatorId?: string;
  aircraftId?: string;
  flightDetails?: Partial<FlightDetails>;
  requestedPeriod?: DateRange;
}

export interface SubmitApplicationRequest {
  applicationId: string;
}

export interface ReviewApplicationRequest {
  applicationId: string;
  notes?: string;
}

export interface ApproveApplicationRequest {
  applicationId: string;
  notes?: string;
}

export interface RejectApplicationRequest {
  applicationId: string;
  reason: string;
}

export interface ApplicationFilter {
  status?: ApplicationStatus[];
  type?: ApplicationType[];
  operatorId?: string;
  submittedDateFrom?: string;
  submittedDateTo?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface FeeCalculationRequest {
  type: ApplicationType;
  seatCount: number;
  mtowKg: number;
}

export interface FeeCalculationResult {
  baseFee: Money;
  seatFee: Money;
  weightFee: Money;
  multiplier: number;
  totalFee: Money;
  breakdown: {
    description: string;
    amount: Money;
  }[];
}
