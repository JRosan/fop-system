import { apiClient } from '../client';

export interface SubscriptionPlan {
  id: string;
  tier: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxUsers: number | null;
  maxApplicationsPerMonth: number | null;
  includesCustomBranding: boolean;
  includesApiAccess: boolean;
  includesPrioritySupport: boolean;
  includesDedicatedManager: boolean;
  includesAdvancedAnalytics: boolean;
  includesSlaGuarantee: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface TenantSubscription {
  tenantId: string;
  tenantName: string;
  subscriptionTier: string;
  isAnnualBilling: boolean;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  trialEndDate: string | null;
  isActive: boolean;
  currentPlan: SubscriptionPlan | null;
}

export interface UpdateSubscriptionRequest {
  tier: string;
  isAnnualBilling: boolean;
}

export interface StartTrialRequest {
  trialDays?: number;
}

/**
 * Subscription API service for managing SaaS subscriptions.
 */
export const subscriptionApi = {
  /**
   * Get all active subscription plans.
   */
  async getPlans(includeInactive = false): Promise<SubscriptionPlan[]> {
    const { data } = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans', {
      params: { includeInactive },
    });
    return data;
  },

  /**
   * Get a tenant's current subscription details.
   */
  async getTenantSubscription(tenantId: string): Promise<TenantSubscription> {
    const { data } = await apiClient.get<TenantSubscription>(`/subscriptions/tenants/${tenantId}`);
    return data;
  },

  /**
   * Update a tenant's subscription (upgrade/downgrade).
   */
  async updateSubscription(
    tenantId: string,
    request: UpdateSubscriptionRequest
  ): Promise<TenantSubscription> {
    const { data } = await apiClient.put<TenantSubscription>(
      `/subscriptions/tenants/${tenantId}`,
      request
    );
    return data;
  },

  /**
   * Start a trial for a tenant.
   */
  async startTrial(
    tenantId: string,
    request?: StartTrialRequest
  ): Promise<TenantSubscription> {
    const { data } = await apiClient.post<TenantSubscription>(
      `/subscriptions/tenants/${tenantId}/trial`,
      request || {}
    );
    return data;
  },
};
