using FopSystem.Domain.Entities;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class FeeConfigurationRepository : IFeeConfigurationRepository
{
    private readonly FopDbContext _context;

    public FeeConfigurationRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<FeeConfiguration?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.FeeConfigurations.FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<FeeConfiguration?> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.FeeConfigurations
            .Where(f => f.IsActive)
            .Where(f => !f.EffectiveFrom.HasValue || f.EffectiveFrom <= now)
            .Where(f => !f.EffectiveTo.HasValue || f.EffectiveTo >= now)
            .OrderByDescending(f => f.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FeeConfiguration>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FeeConfigurations
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<FeeConfiguration> Items, int TotalCount)> GetPagedAsync(
        bool? isActive = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.FeeConfigurations.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(f => f.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Add(FeeConfiguration configuration)
    {
        _context.FeeConfigurations.Add(configuration);
    }

    public void Remove(FeeConfiguration configuration)
    {
        _context.FeeConfigurations.Remove(configuration);
    }
}
