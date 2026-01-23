using FopSystem.Domain.Entities;

namespace FopSystem.Domain.Repositories;

/// <summary>
/// Repository interface for tenant management operations.
/// Note: This repository does not implement ITenantEntity as tenants
/// are the top-level entity for multi-tenancy.
/// </summary>
public interface ITenantRepository
{
    /// <summary>
    /// Gets a tenant by its unique identifier.
    /// </summary>
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a tenant by its short code (e.g., "BVI").
    /// </summary>
    Task<Tenant?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a tenant by its subdomain (e.g., "bvi").
    /// </summary>
    Task<Tenant?> GetBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all tenants.
    /// </summary>
    Task<IReadOnlyList<Tenant>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active tenants.
    /// </summary>
    Task<IReadOnlyList<Tenant>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a tenant with the given code exists.
    /// </summary>
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a tenant with the given subdomain exists.
    /// </summary>
    Task<bool> ExistsBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new tenant.
    /// </summary>
    Task<Tenant> AddAsync(Tenant tenant, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing tenant.
    /// </summary>
    void Update(Tenant tenant);
}
