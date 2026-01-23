using FopSystem.Domain.Entities;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for tenant management.
/// Note: This repository does not apply tenant filters as tenants
/// are the top-level entity for multi-tenancy.
/// </summary>
public class TenantRepository : ITenantRepository
{
    private readonly FopDbContext _context;

    public TenantRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Tenant?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.ToUpperInvariant();
        return await _context.Tenants
            .FirstOrDefaultAsync(t => t.Code == normalizedCode, cancellationToken);
    }

    public async Task<Tenant?> GetBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default)
    {
        var normalizedSubdomain = subdomain.ToLowerInvariant();
        return await _context.Tenants
            .FirstOrDefaultAsync(t => t.Subdomain == normalizedSubdomain, cancellationToken);
    }

    public async Task<IReadOnlyList<Tenant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Tenant>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.ToUpperInvariant();
        return await _context.Tenants
            .AnyAsync(t => t.Code == normalizedCode, cancellationToken);
    }

    public async Task<bool> ExistsBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default)
    {
        var normalizedSubdomain = subdomain.ToLowerInvariant();
        return await _context.Tenants
            .AnyAsync(t => t.Subdomain == normalizedSubdomain, cancellationToken);
    }

    public async Task<Tenant> AddAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        await _context.Tenants.AddAsync(tenant, cancellationToken);
        return tenant;
    }

    public void Update(Tenant tenant)
    {
        _context.Tenants.Update(tenant);
    }
}
