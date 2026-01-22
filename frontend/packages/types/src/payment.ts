import type { Money } from './common';

export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'WIRE_TRANSFER';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface Payment {
  id: string;
  applicationId: string;
  amount: Money;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  paymentDate?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  id: string;
  applicationId: string;
  amount: Money;
  status: PaymentStatus;
  paymentDate?: string;
  receiptNumber?: string;
}

export interface InitiatePaymentRequest {
  applicationId: string;
  method: PaymentMethod;
  returnUrl: string;
  cancelUrl: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  redirectUrl?: string;
  bankDetails?: BankTransferDetails;
}

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  reference: string;
  instructions: string;
}

export interface ConfirmPaymentRequest {
  paymentId: string;
  transactionReference: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  applicationNumber: string;
  operatorName: string;
  amount: Money;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  description: string;
  issuedBy: string;
  issuedAt: string;
}

export interface PaymentFilter {
  status?: PaymentStatus[];
  method?: PaymentMethod[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}
