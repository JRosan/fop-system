using FopSystem.Domain.Aggregates.Aircraft;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class AircraftRepository : IAircraftRepository
{
    private readonly FopDbContext _context;

    public AircraftRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<Aircraft?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Aircraft.FindAsync([id], cancellationToken);
    }

    public async Task<IReadOnlyList<Aircraft>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Aircraft.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Aircraft entity, CancellationToken cancellationToken = default)
    {
        await _context.Aircraft.AddAsync(entity, cancellationToken);
    }

    public void Update(Aircraft entity)
    {
        _context.Aircraft.Update(entity);
    }

    public void Remove(Aircraft entity)
    {
        _context.Aircraft.Remove(entity);
    }

    public async Task<Aircraft?> GetByRegistrationMarkAsync(
        string registrationMark,
        CancellationToken cancellationToken = default)
    {
        return await _context.Aircraft
            .FirstOrDefaultAsync(a => a.RegistrationMark == registrationMark, cancellationToken);
    }

    public async Task<IReadOnlyList<Aircraft>> GetByOperatorIdAsync(
        Guid operatorId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Aircraft
            .Where(a => a.OperatorId == operatorId)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Aircraft> Items, int TotalCount)> GetPagedAsync(
        Guid? operatorId = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Aircraft.AsQueryable();

        if (operatorId.HasValue)
        {
            query = query.Where(a => a.OperatorId == operatorId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a =>
                a.RegistrationMark.Contains(search) ||
                a.Manufacturer.Contains(search) ||
                a.Model.Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(a => a.RegistrationMark)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<bool> ExistsAsync(string registrationMark, CancellationToken cancellationToken = default)
    {
        return await _context.Aircraft
            .AnyAsync(a => a.RegistrationMark == registrationMark, cancellationToken);
    }
}
