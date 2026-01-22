using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class BviaFeeRateRepository : IBviaFeeRateRepository
{
    private readonly FopDbContext _context;

    public BviaFeeRateRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<BviaFeeRate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.BviaFeeRates.FindAsync([id], cancellationToken);
    }

    public async Task<IReadOnlyList<BviaFeeRate>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.BviaFeeRates.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(BviaFeeRate entity, CancellationToken cancellationToken = default)
    {
        await _context.BviaFeeRates.AddAsync(entity, cancellationToken);
    }

    public void Update(BviaFeeRate entity)
    {
        _context.BviaFeeRates.Update(entity);
    }

    public void Remove(BviaFeeRate entity)
    {
        _context.BviaFeeRates.Remove(entity);
    }

    public async Task<IReadOnlyList<BviaFeeRate>> GetActiveRatesAsync(DateOnly effectiveDate, CancellationToken cancellationToken = default)
    {
        return await _context.BviaFeeRates
            .Where(r => r.IsActive &&
                        r.EffectiveFrom <= effectiveDate &&
                        (r.EffectiveTo == null || r.EffectiveTo >= effectiveDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BviaFeeRate>> GetByCategoryAsync(BviaFeeCategory category, CancellationToken cancellationToken = default)
    {
        return await _context.BviaFeeRates
            .Where(r => r.Category == category)
            .ToListAsync(cancellationToken);
    }

    public async Task<BviaFeeRate?> GetRateAsync(
        BviaFeeCategory category,
        FlightOperationType operationType,
        DateOnly effectiveDate,
        BviAirport? airport = null,
        MtowTierLevel? mtowTier = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.BviaFeeRates
            .Where(r => r.Category == category &&
                        r.OperationType == operationType &&
                        r.IsActive &&
                        r.EffectiveFrom <= effectiveDate &&
                        (r.EffectiveTo == null || r.EffectiveTo >= effectiveDate));

        if (airport.HasValue)
        {
            query = query.Where(r => r.Airport == airport || r.Airport == null);
        }

        if (mtowTier.HasValue)
        {
            query = query.Where(r => r.MtowTier == mtowTier || r.MtowTier == null);
        }

        // Return most specific match (with airport/mtowTier if available)
        return await query
            .OrderByDescending(r => r.Airport.HasValue ? 1 : 0)
            .ThenByDescending(r => r.MtowTier.HasValue ? 1 : 0)
            .ThenByDescending(r => r.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BviaFeeRate>> GetLandingRatesAsync(
        FlightOperationType operationType,
        DateOnly effectiveDate,
        CancellationToken cancellationToken = default)
    {
        return await _context.BviaFeeRates
            .Where(r => r.Category == BviaFeeCategory.Landing &&
                        r.OperationType == operationType &&
                        r.IsActive &&
                        r.EffectiveFrom <= effectiveDate &&
                        (r.EffectiveTo == null || r.EffectiveTo >= effectiveDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BviaFeeRate>> GetPassengerRatesAsync(
        BviAirport airport,
        DateOnly effectiveDate,
        CancellationToken cancellationToken = default)
    {
        return await _context.BviaFeeRates
            .Where(r => (r.Category == BviaFeeCategory.AirportDevelopment ||
                         r.Category == BviaFeeCategory.Security ||
                         r.Category == BviaFeeCategory.HoldBaggageScreening) &&
                        (r.Airport == airport || r.Airport == null) &&
                        r.IsActive &&
                        r.EffectiveFrom <= effectiveDate &&
                        (r.EffectiveTo == null || r.EffectiveTo >= effectiveDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<BviaFeeRate> Items, int TotalCount)> GetPagedAsync(
        BviaFeeCategory? category = null,
        FlightOperationType? operationType = null,
        BviAirport? airport = null,
        bool? isActive = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.BviaFeeRates.AsQueryable();

        if (category.HasValue)
        {
            query = query.Where(r => r.Category == category.Value);
        }

        if (operationType.HasValue)
        {
            query = query.Where(r => r.OperationType == operationType.Value);
        }

        if (airport.HasValue)
        {
            query = query.Where(r => r.Airport == airport.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(r => r.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(r => r.Category)
            .ThenBy(r => r.OperationType)
            .ThenByDescending(r => r.EffectiveFrom)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
