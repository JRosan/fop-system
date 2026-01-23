namespace FopSystem.Domain.Services;

/// <summary>
/// Provides access to the current tenant context.
/// This service is scoped to the current request and provides
/// tenant information resolved from the request headers, subdomain, or JWT claims.
/// </summary>
public interface ITenantContext
{
    /// <summary>
    /// The unique identifier of the current tenant.
    /// Throws InvalidOperationException if no tenant is set.
    /// </summary>
    Guid TenantId { get; }

    /// <summary>
    /// The short code of the current tenant (e.g., "BVI").
    /// Throws InvalidOperationException if no tenant is set.
    /// </summary>
    string TenantCode { get; }

    /// <summary>
    /// Whether a tenant has been resolved for the current context.
    /// </summary>
    bool HasTenant { get; }

    /// <summary>
    /// Sets the tenant for the current context.
    /// This is typically called by the TenantResolutionMiddleware.
    /// </summary>
    /// <param name="tenantId">The tenant ID.</param>
    /// <param name="tenantCode">The tenant code.</param>
    void SetTenant(Guid tenantId, string tenantCode);
}
