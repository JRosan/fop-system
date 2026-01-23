import { apiClient } from '../client';
import type {
  Tenant,
  TenantBranding,
  TenantSummary,
  CreateTenantRequest,
  UpdateTenantRequest,
} from '@fop/types';

/**
 * Tenant API service for multi-tenant operations.
 */
export const tenantApi = {
  /**
   * Get the current tenant based on context (subdomain, header, or JWT).
   * This is the primary method for fetching tenant branding.
   */
  async getCurrent(): Promise<TenantBranding> {
    const { data } = await apiClient.get<TenantBranding>('/tenants/current');
    return data;
  },

  /**
   * Get a tenant by ID (requires authentication).
   */
  async getById(id: string): Promise<Tenant> {
    const { data } = await apiClient.get<Tenant>(`/tenants/${id}`);
    return data;
  },

  /**
   * Get all tenants (SuperAdmin only).
   */
  async getAll(): Promise<TenantSummary[]> {
    const { data } = await apiClient.get<TenantSummary[]>('/tenants');
    return data;
  },

  /**
   * Create a new tenant (SuperAdmin only).
   */
  async create(request: CreateTenantRequest): Promise<Tenant> {
    const { data } = await apiClient.post<Tenant>('/tenants', request);
    return data;
  },

  /**
   * Update tenant settings.
   */
  async update(id: string, request: UpdateTenantRequest): Promise<Tenant> {
    const { data } = await apiClient.put<Tenant>(`/tenants/${id}`, request);
    return data;
  },

  /**
   * Seed default fee rates for a tenant (SuperAdmin only).
   */
  async seedFeeRates(id: string): Promise<void> {
    await apiClient.post(`/tenants/${id}/seed-fees`);
  },

  /**
   * Resolve tenant from subdomain (public endpoint for initial load).
   */
  async resolveBySubdomain(subdomain: string): Promise<TenantBranding | null> {
    try {
      const { data } = await apiClient.get<TenantBranding>(
        `/tenants/resolve/${subdomain}`
      );
      return data;
    } catch {
      return null;
    }
  },
};
