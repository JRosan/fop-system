import { apiClient } from '../client';
import type { Payment, PaymentMethod } from '@fop/types';

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
};
