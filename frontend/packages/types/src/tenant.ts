/**
 * Tenant entity for multi-tenant SaaS support.
 * Represents a territory/jurisdiction using the FOP system.
 */
export interface Tenant {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string | null;
  timeZone: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Minimal tenant info returned for branding purposes.
 */
export interface TenantBranding {
  id: string;
  code: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
}

/**
 * Request to create a new tenant (SuperAdmin only).
 */
export interface CreateTenantRequest {
  code: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactPhone?: string;
  timeZone?: string;
  currency?: string;
}

/**
 * Request to update tenant settings.
 */
export interface UpdateTenantRequest {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string | null;
  timeZone?: string;
  currency?: string;
  isActive?: boolean;
}

/**
 * Tenant summary for listing.
 */
export interface TenantSummary {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  createdAt: string;
}
