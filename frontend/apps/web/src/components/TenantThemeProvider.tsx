import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantApi } from '@fop/api';
import { useTenantStore } from '@fop/core';
import type { TenantBranding } from '@fop/types';
import { useTenantTheme, type TenantTheme } from '@fop/theme';

interface TenantContextValue {
  tenant: TenantBranding | null;
  theme: TenantTheme | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantThemeProviderProps {
  children: ReactNode;
  /**
   * Optional subdomain override for testing or when subdomain
   * cannot be determined from window.location.
   */
  subdomainOverride?: string;
}

/**
 * Extracts the subdomain from the current URL.
 * Returns null if on localhost or no subdomain is present.
 */
function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;

  // Skip for localhost/IP addresses
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  const parts = hostname.split('.');
  // Need at least subdomain.domain.tld
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export function TenantThemeProvider({
  children,
  subdomainOverride,
}: TenantThemeProviderProps) {
  const { tenant: storedTenant, setTenant, setError, setLoading } = useTenantStore();

  // Determine subdomain (override or from URL)
  const subdomain = subdomainOverride || getSubdomain();

  // Fetch current tenant
  const {
    data: fetchedTenant,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['tenant', 'current', subdomain],
    queryFn: async () => {
      // If we have a subdomain, try to resolve by subdomain first
      if (subdomain) {
        const resolved = await tenantApi.resolveBySubdomain(subdomain);
        if (resolved) return resolved;
      }
      // Fall back to current tenant endpoint (uses header or JWT)
      return tenantApi.getCurrent();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - tenant config rarely changes
    retry: 1,
    // Use stored tenant as initial data if available
    initialData: storedTenant || undefined,
  });

  // Sync fetched tenant to store
  useEffect(() => {
    if (fetchedTenant && fetchedTenant.id !== storedTenant?.id) {
      setTenant(fetchedTenant);
    }
  }, [fetchedTenant, storedTenant?.id, setTenant]);

  // Sync loading state
  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  // Sync error state
  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load tenant');
    }
  }, [queryError, setError]);

  // Generate theme from tenant
  const tenant = fetchedTenant || storedTenant;
  const theme = useTenantTheme(tenant);

  const contextValue: TenantContextValue = {
    tenant,
    theme,
    isLoading: queryLoading && !tenant,
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load tenant') : null,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context.
 * Must be used within a TenantThemeProvider.
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantThemeProvider');
  }
  return context;
}

/**
 * Hook to get tenant branding with loading state handling.
 * Returns default values while loading.
 */
export function useTenantBranding() {
  const { tenant, isLoading } = useTenant();

  return {
    name: tenant?.name || 'FOP System',
    code: tenant?.code || 'FOP',
    logoUrl: tenant?.logoUrl,
    primaryColor: tenant?.primaryColor || '#0066e6',
    secondaryColor: tenant?.secondaryColor || '#009999',
    currency: tenant?.currency || 'USD',
    isLoading,
  };
}
