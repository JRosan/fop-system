using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class OperatorRepository : IOperatorRepository
{
    private readonly FopDbContext _context;

    public OperatorRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<Operator?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Operators
            .Include(o => o.Aircraft)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Operator>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Operators
            .Include(o => o.Aircraft)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Operator entity, CancellationToken cancellationToken = default)
    {
        await _context.Operators.AddAsync(entity, cancellationToken);
    }

    public void Update(Operator entity)
    {
        _context.Operators.Update(entity);
    }

    public void Remove(Operator entity)
    {
        _context.Operators.Remove(entity);
    }

    public async Task<Operator?> GetByRegistrationNumberAsync(
        string registrationNumber,
        CancellationToken cancellationToken = default)
    {
        return await _context.Operators
            .Include(o => o.Aircraft)
            .FirstOrDefaultAsync(o => o.RegistrationNumber == registrationNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<Operator>> GetByCountryAsync(
        string country,
        CancellationToken cancellationToken = default)
    {
        return await _context.Operators
            .Where(o => o.Country == country)
            .Include(o => o.Aircraft)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Operator> Items, int TotalCount)> GetPagedAsync(
        string? country = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Operators.AsQueryable();

        if (!string.IsNullOrWhiteSpace(country))
        {
            query = query.Where(o => o.Country == country);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(o =>
                o.Name.Contains(search) ||
                o.RegistrationNumber.Contains(search) ||
                o.AocNumber.Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(o => o.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(o => o.Aircraft)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<bool> ExistsAsync(string registrationNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Operators
            .AnyAsync(o => o.RegistrationNumber == registrationNumber, cancellationToken);
    }
}
