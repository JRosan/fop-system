import { apiClient } from '../client';
import type { Payment, PaymentMethod, PaymentStatus, PaymentFilter, PaginatedResponse } from '@fop/types';

export interface PaymentResult {
  success: boolean;
  receiptNumber: string;
  message: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  applicationNumber: string;
  operatorName: string;
  amount: { amount: number; currency: string };
  paymentMethod: string;
  paymentDate: string;
  description: string;
  issuedBy: string;
  issuedAt: string;
}

export interface PaymentWithApplication extends Payment {
  applicationNumber: string;
  operatorName: string;
}

export interface RecordPaymentRequest {
  applicationId: string;
  method: PaymentMethod;
  transactionReference: string;
  amount: number;
  currency: string;
  paymentDate: string;
  notes?: string;
}

export interface RevenueReport {
  period: string;
  totalCollected: { amount: number; currency: string };
  totalPending: { amount: number; currency: string };
  paymentsByMethod: {
    method: PaymentMethod;
    count: number;
    total: { amount: number; currency: string };
  }[];
  paymentsByStatus: {
    status: PaymentStatus;
    count: number;
    total: { amount: number; currency: string };
  }[];
}

export const paymentsApi = {
  async process(
    applicationId: string,
    method: PaymentMethod,
    transactionReference: string
  ): Promise<PaymentResult> {
    const { data } = await apiClient.post('/payments/process', {
      applicationId,
      method,
      transactionReference,
    });
    return data;
  },

  async getByApplication(applicationId: string): Promise<Payment> {
    const { data } = await apiClient.get(`/payments/application/${applicationId}`);
    return data;
  },

  async getReceipt(applicationId: string): Promise<PaymentReceipt> {
    const { data } = await apiClient.get(`/payments/receipt/${applicationId}`);
    return data;
  },

  async getAll(filter?: PaymentFilter): Promise<PaginatedResponse<PaymentWithApplication>> {
    const { data } = await apiClient.get('/payments', { params: filter });
    // Flatten the response - backend returns { payment: {...}, applicationNumber, operatorName }
    return {
      ...data,
      items: (data.items || []).map((item: { payment: Payment; applicationNumber: string; operatorName: string }) => ({
        ...item.payment,
        applicationNumber: item.applicationNumber,
        operatorName: item.operatorName,
      })),
    };
  },

  async getPending(): Promise<PaymentWithApplication[]> {
    const { data } = await apiClient.get('/payments', {
      params: { status: [1, 2] }, // 1 = Pending, 2 = Processing (numeric values)
    });
    // Flatten the response
    const items = data.items || data;
    return (items || []).map((item: { payment: Payment; applicationNumber: string; operatorName: string }) => ({
      ...item.payment,
      applicationNumber: item.applicationNumber,
      operatorName: item.operatorName,
    }));
  },

  async recordPayment(request: RecordPaymentRequest): Promise<PaymentResult> {
    const { data } = await apiClient.post('/payments/record', request);
    return data;
  },

  async verifyBankTransfer(applicationId: string, verifiedBy: string, notes?: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`/payments/${applicationId}/verify`, {
      verifiedBy,
      notes,
    });
    return data;
  },

  async rejectPayment(paymentId: string, reason: string): Promise<void> {
    await apiClient.post(`/payments/${paymentId}/reject`, { reason });
  },

  async refund(paymentId: string, reason: string): Promise<void> {
    await apiClient.post(`/payments/${paymentId}/refund`, { reason });
  },

  async getRevenueReport(startDate: string, endDate: string): Promise<RevenueReport> {
    const { data } = await apiClient.get('/payments/revenue-report', {
      params: { startDate, endDate },
    });
    return data;
  },
};
