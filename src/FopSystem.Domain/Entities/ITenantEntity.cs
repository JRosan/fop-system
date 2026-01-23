namespace FopSystem.Domain.Entities;

/// <summary>
/// Interface for entities that are scoped to a specific tenant.
/// All tenant-scoped entities must implement this interface to enable
/// automatic tenant isolation via EF Core global query filters.
/// </summary>
public interface ITenantEntity
{
    /// <summary>
    /// The unique identifier of the tenant this entity belongs to.
    /// </summary>
    Guid TenantId { get; }

    /// <summary>
    /// Sets the tenant ID for this entity. This should only be called
    /// during entity creation, typically by the DbContext.
    /// </summary>
    /// <param name="tenantId">The tenant ID to assign.</param>
    void SetTenantId(Guid tenantId);
}
