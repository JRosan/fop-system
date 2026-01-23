import { apiClient } from '../client';

export interface CreateCheckoutSessionRequest {
  tenantId: string;
  planId: string;
  isAnnual: boolean;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
}

export interface CreatePortalSessionRequest {
  stripeCustomerId: string;
  returnUrl?: string;
}

export interface CreatePortalSessionResponse {
  portalUrl: string;
}

export interface StripeConfig {
  publishableKey: string;
  enabled: boolean;
}

/**
 * Stripe API service for payment processing.
 */
export const stripeApi = {
  /**
   * Get Stripe configuration (publishable key).
   */
  async getConfig(): Promise<StripeConfig> {
    const { data } = await apiClient.get<StripeConfig>('/stripe/config');
    return data;
  },

  /**
   * Create a Stripe Checkout session for subscription.
   */
  async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    const { data } = await apiClient.post<CreateCheckoutSessionResponse>(
      '/stripe/checkout-session',
      request
    );
    return data;
  },

  /**
   * Create a Stripe Billing Portal session for subscription management.
   */
  async createPortalSession(
    request: CreatePortalSessionRequest
  ): Promise<CreatePortalSessionResponse> {
    const { data } = await apiClient.post<CreatePortalSessionResponse>(
      '/stripe/portal-session',
      request
    );
    return data;
  },

  /**
   * Redirect to Stripe Checkout.
   */
  async redirectToCheckout(
    tenantId: string,
    planId: string,
    isAnnual: boolean,
    customerEmail?: string
  ): Promise<void> {
    const baseUrl = window.location.origin;
    const response = await this.createCheckoutSession({
      tenantId,
      planId,
      isAnnual,
      customerEmail,
      successUrl: `${baseUrl}/subscription?success=true`,
      cancelUrl: `${baseUrl}/subscription?canceled=true`,
    });

    // Redirect to Stripe Checkout
    window.location.href = response.sessionUrl;
  },

  /**
   * Redirect to Stripe Billing Portal.
   */
  async redirectToPortal(stripeCustomerId: string): Promise<void> {
    const baseUrl = window.location.origin;
    const response = await this.createPortalSession({
      stripeCustomerId,
      returnUrl: `${baseUrl}/subscription`,
    });

    // Redirect to Stripe Portal
    window.location.href = response.portalUrl;
  },
};
