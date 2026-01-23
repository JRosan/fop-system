import { apiClient } from '../client';

// Invoice types
export type InvoiceStatus = 'Draft' | 'Pending' | 'PartiallyPaid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceLineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
  isInterestCharge?: boolean;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  currency: string;
  method: 'CreditCard' | 'BankTransfer' | 'Check' | 'Cash' | 'Other';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  transactionReference?: string;
  receiptNumber?: string;
  paidAt: string;
  recordedBy?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  operatorId: string;
  operatorName: string;
  aircraftId?: string;
  aircraftRegistration?: string;
  flightDate?: string;
  airport: string;
  operationType?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  dueDate: string;
  isOverdue: boolean;
  daysOverdue?: number;
  interestCharged?: number;
  payments: InvoicePayment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
  paidAt?: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  operatorName: string;
  aircraftRegistration?: string;
  flightDate?: string;
  airport: string;
  totalAmount: number;
  balanceDue: number;
  currency: string;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
}

export interface AccountStatus {
  operatorId: string;
  operatorName: string;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  overdueInvoiceCount: number;
  currency: string;
  isEligibleForPermits: boolean;
  eligibilityBlockReason?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface InvoiceFilters {
  operatorId?: string;
  statuses?: InvoiceStatus[];
  airport?: string;
  fromDate?: string;
  toDate?: string;
  isOverdue?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface InvoicePaymentRequest {
  amount: number;
  method: 'CreditCard' | 'BankTransfer' | 'Check' | 'Cash' | 'Other';
  transactionReference?: string;
  notes?: string;
  paidAt?: string;
}

export interface GenerateInvoiceRequest {
  operatorId: string;
  aircraftId?: string;
  flightDate?: string;
  airport: string;
  operationType?: string;
  lineItems: Array<{
    category: string;
    description: string;
    quantity: number;
    unitRate: number;
  }>;
  notes?: string;
}

export interface FeeCalculationRequest {
  permitType: 'OneTime' | 'Blanket' | 'Emergency';
  aircraftCategory: string;
  mtowKg: number;
  seatCount: number;
}

export interface FeeCalculationResult {
  baseFee: number;
  seatFee: number;
  weightFee: number;
  multiplier: number;
  totalFee: number;
  currency: string;
  breakdown: Array<{
    description: string;
    amount: number;
  }>;
}

export const invoicesApi = {
  /**
   * Get paginated list of invoices with optional filters
   */
  getInvoices: async (filters?: InvoiceFilters) => {
    const params = new URLSearchParams();
    if (filters?.operatorId) params.append('operatorId', filters.operatorId);
    if (filters?.statuses?.length) {
      filters.statuses.forEach(s => params.append('statuses', s));
    }
    if (filters?.airport) params.append('airport', filters.airport);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.isOverdue !== undefined) params.append('isOverdue', String(filters.isOverdue));
    if (filters?.pageNumber) params.append('pageNumber', String(filters.pageNumber));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const response = await apiClient.get<{
      items: InvoiceSummary[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(`/bvia/invoices?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single invoice by ID with full details
   */
  getInvoice: async (id: string) => {
    const response = await apiClient.get<Invoice>(`/bvia/invoices/${id}`);
    return response.data;
  },

  /**
   * Get operator account status including outstanding balance
   */
  getAccountStatus: async (operatorId: string) => {
    const response = await apiClient.get<AccountStatus>(`/bvia/operators/${operatorId}/account`);
    return response.data;
  },

  /**
   * Check if operator is eligible for new permits
   */
  checkPermitEligibility: async (operatorId: string) => {
    const response = await apiClient.get<{
      isEligible: boolean;
      reason?: string;
      outstandingAmount?: number;
    }>(`/bvia/operators/${operatorId}/permit-eligibility`);
    return response.data;
  },

  /**
   * Calculate fees for a permit application
   */
  calculateFees: async (request: FeeCalculationRequest) => {
    const response = await apiClient.post<FeeCalculationResult>('/bvia/fees/calculate', request);
    return response.data;
  },

  /**
   * Generate a pre-arrival invoice (Reviewer role required)
   */
  generateInvoice: async (request: GenerateInvoiceRequest) => {
    const response = await apiClient.post<{ id: string; invoiceNumber: string }>('/bvia/invoices/generate', request);
    return response.data;
  },

  /**
   * Finalize a draft invoice (Reviewer role required)
   */
  finalizeInvoice: async (id: string, finalizedBy: string) => {
    const response = await apiClient.post<Invoice>(`/bvia/invoices/${id}/finalize`, { finalizedBy });
    return response.data;
  },

  /**
   * Record a payment against an invoice (Finance role required)
   */
  recordPayment: async (invoiceId: string, payment: InvoicePaymentRequest) => {
    const response = await apiClient.post<{
      paymentId: string;
      receiptNumber: string;
      newBalance: number;
      invoiceStatus: InvoiceStatus;
    }>(`/bvia/invoices/${invoiceId}/payments`, payment);
    return response.data;
  },

  /**
   * Get payment receipt
   */
  getPaymentReceipt: async (invoiceId: string, paymentId: string) => {
    const response = await apiClient.get<{
      receiptNumber: string;
      invoiceNumber: string;
      amount: number;
      currency: string;
      method: string;
      paidAt: string;
      operatorName: string;
    }>(`/bvia/invoices/${invoiceId}/payments/${paymentId}/receipt`);
    return response.data;
  },

  /**
   * Get invoices summary statistics for an operator
   */
  getInvoiceStats: async (operatorId: string) => {
    const response = await apiClient.get<{
      totalInvoices: number;
      pendingCount: number;
      paidCount: number;
      overdueCount: number;
      totalOutstanding: number;
      currency: string;
    }>(`/bvia/operators/${operatorId}/invoice-stats`);
    return response.data;
  },
};

export default invoicesApi;
