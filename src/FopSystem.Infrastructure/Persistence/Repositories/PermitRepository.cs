using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class PermitRepository : IPermitRepository
{
    private readonly FopDbContext _context;

    public PermitRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<Permit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Permits.FindAsync([id], cancellationToken);
    }

    public async Task<IReadOnlyList<Permit>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Permits.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Permit entity, CancellationToken cancellationToken = default)
    {
        await _context.Permits.AddAsync(entity, cancellationToken);
    }

    public void Update(Permit entity)
    {
        _context.Permits.Update(entity);
    }

    public void Remove(Permit entity)
    {
        _context.Permits.Remove(entity);
    }

    public async Task<Permit?> GetByPermitNumberAsync(
        string permitNumber,
        CancellationToken cancellationToken = default)
    {
        return await _context.Permits
            .FirstOrDefaultAsync(p => p.PermitNumber == permitNumber, cancellationToken);
    }

    public async Task<Permit?> GetByApplicationIdAsync(
        Guid applicationId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Permits
            .FirstOrDefaultAsync(p => p.ApplicationId == applicationId, cancellationToken);
    }

    public async Task<IReadOnlyList<Permit>> GetByOperatorIdAsync(
        Guid operatorId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Permits
            .Where(p => p.OperatorId == operatorId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Permit>> GetByStatusAsync(
        PermitStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _context.Permits
            .Where(p => p.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Permit>> GetExpiringPermitsAsync(
        DateOnly asOfDate,
        int daysThreshold,
        CancellationToken cancellationToken = default)
    {
        var warningDate = asOfDate.AddDays(daysThreshold);
        return await _context.Permits
            .Where(p => p.Status == PermitStatus.Active &&
                        p.ValidUntil >= asOfDate &&
                        p.ValidUntil <= warningDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Permit>> GetExpiredPermitsAsync(
        DateOnly asOfDate,
        CancellationToken cancellationToken = default)
    {
        return await _context.Permits
            .Where(p => p.Status == PermitStatus.Active && p.ValidUntil < asOfDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Permit> Items, int TotalCount)> GetPagedAsync(
        PermitStatus[]? statuses = null,
        ApplicationType[]? types = null,
        Guid? operatorId = null,
        DateTime? issuedFrom = null,
        DateTime? issuedTo = null,
        int? expiringWithinDays = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Permits.AsQueryable();

        if (statuses is { Length: > 0 })
        {
            query = query.Where(p => statuses.Contains(p.Status));
        }

        if (types is { Length: > 0 })
        {
            query = query.Where(p => types.Contains(p.Type));
        }

        if (operatorId.HasValue)
        {
            query = query.Where(p => p.OperatorId == operatorId.Value);
        }

        if (issuedFrom.HasValue)
        {
            query = query.Where(p => p.IssuedAt >= issuedFrom.Value);
        }

        if (issuedTo.HasValue)
        {
            query = query.Where(p => p.IssuedAt <= issuedTo.Value);
        }

        if (expiringWithinDays.HasValue)
        {
            var expiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(expiringWithinDays.Value));
            query = query.Where(p => p.Status == PermitStatus.Active && p.ValidUntil <= expiryDate);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p =>
                p.PermitNumber.Contains(search) ||
                p.OperatorName.Contains(search) ||
                p.AircraftRegistration.Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.IssuedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
