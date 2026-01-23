using FopSystem.Domain.Services;

namespace FopSystem.Infrastructure.Services;

/// <summary>
/// Request-scoped implementation of ITenantContext.
/// Stores the resolved tenant information for the current request.
/// </summary>
public class TenantContext : ITenantContext
{
    private Guid? _tenantId;
    private string? _tenantCode;

    public Guid TenantId => _tenantId ?? throw new InvalidOperationException(
        "No tenant has been set for the current context. Ensure the request includes tenant identification " +
        "via X-Tenant-Id header, subdomain, or authenticated user's tenant_id claim.");

    public string TenantCode => _tenantCode ?? throw new InvalidOperationException(
        "No tenant has been set for the current context. Ensure the request includes tenant identification " +
        "via X-Tenant-Id header, subdomain, or authenticated user's tenant_id claim.");

    public bool HasTenant => _tenantId.HasValue;

    public void SetTenant(Guid tenantId, string tenantCode)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantCode, nameof(tenantCode));

        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));

        _tenantId = tenantId;
        _tenantCode = tenantCode;
    }
}
