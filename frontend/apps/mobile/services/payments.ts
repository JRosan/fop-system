import { Linking, Platform } from 'react-native';
import { apiClient } from './api';

export interface PaymentIntentRequest {
  invoiceId: string;
  amount: number;
  currency: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  checkoutUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  receiptNumber?: string;
  error?: string;
}

/**
 * Payment service for handling invoice payments via Stripe
 * Uses web-based checkout flow for maximum compatibility
 */
export const paymentService = {
  /**
   * Create a Stripe checkout session for an invoice
   */
  createCheckoutSession: async (invoiceId: string): Promise<CheckoutSessionResponse> => {
    const response = await apiClient.post<CheckoutSessionResponse>(
      `/bvia/invoices/${invoiceId}/checkout`,
      {
        successUrl: getCallbackUrl('success'),
        cancelUrl: getCallbackUrl('cancel'),
      }
    );
    return response.data;
  },

  /**
   * Open Stripe checkout in the browser
   */
  openCheckout: async (invoiceId: string): Promise<void> => {
    try {
      const session = await paymentService.createCheckoutSession(invoiceId);

      if (session.url) {
        const supported = await Linking.canOpenURL(session.url);
        if (supported) {
          await Linking.openURL(session.url);
        } else {
          throw new Error('Cannot open payment page');
        }
      }
    } catch (error) {
      console.error('[PaymentService] Failed to open checkout:', error);
      throw error;
    }
  },

  /**
   * Create a payment intent for in-app payment (requires Stripe SDK)
   */
  createPaymentIntent: async (request: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post<PaymentIntentResponse>(
      `/bvia/invoices/${request.invoiceId}/payment-intent`,
      {
        amount: request.amount,
        currency: request.currency,
      }
    );
    return response.data;
  },

  /**
   * Record a manual payment (cash, bank transfer, etc.)
   */
  recordManualPayment: async (
    invoiceId: string,
    payment: {
      amount: number;
      method: 'BankTransfer' | 'Check' | 'Cash' | 'Other';
      transactionReference?: string;
      notes?: string;
    }
  ): Promise<PaymentResult> => {
    try {
      const response = await apiClient.post<{
        paymentId: string;
        receiptNumber: string;
        newBalance: number;
      }>(`/bvia/invoices/${invoiceId}/payments`, payment);

      return {
        success: true,
        paymentId: response.data.paymentId,
        receiptNumber: response.data.receiptNumber,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment recording failed',
      };
    }
  },

  /**
   * Check payment status by invoice ID
   */
  checkPaymentStatus: async (invoiceId: string): Promise<{
    status: 'pending' | 'paid' | 'partially_paid' | 'overdue';
    balanceDue: number;
    lastPaymentDate?: string;
  }> => {
    const response = await apiClient.get<{
      status: string;
      balanceDue: { amount: number };
      lastPaymentDate?: string;
    }>(`/bvia/invoices/${invoiceId}`);

    const statusMap: Record<string, 'pending' | 'paid' | 'partially_paid' | 'overdue'> = {
      Pending: 'pending',
      Paid: 'paid',
      PartiallyPaid: 'partially_paid',
      Overdue: 'overdue',
    };

    return {
      status: statusMap[response.data.status] || 'pending',
      balanceDue: response.data.balanceDue.amount,
      lastPaymentDate: response.data.lastPaymentDate,
    };
  },

  /**
   * Get payment receipt URL
   */
  getReceiptUrl: async (invoiceId: string, paymentId: string): Promise<string> => {
    const response = await apiClient.get<{ receiptUrl: string }>(
      `/bvia/invoices/${invoiceId}/payments/${paymentId}/receipt`
    );
    return response.data.receiptUrl;
  },
};

/**
 * Get the callback URL for payment completion
 */
function getCallbackUrl(status: 'success' | 'cancel'): string {
  // Use deep linking for mobile apps
  const scheme = 'fop-mobile';
  const path = `payment/${status}`;

  if (Platform.OS === 'web') {
    // For web, use the current origin
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/payment/${status}`;
  }

  return `${scheme}://${path}`;
}

export default paymentService;
