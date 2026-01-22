using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class ApplicationRepository : IApplicationRepository
{
    private readonly FopDbContext _context;

    public ApplicationRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<FopApplication?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Include(a => a.Documents)
            .Include(a => a.Payment)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<FopApplication>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Include(a => a.Documents)
            .Include(a => a.Payment)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(FopApplication entity, CancellationToken cancellationToken = default)
    {
        await _context.Applications.AddAsync(entity, cancellationToken);
    }

    public void Update(FopApplication entity)
    {
        _context.Applications.Update(entity);
    }

    public void Remove(FopApplication entity)
    {
        _context.Applications.Remove(entity);
    }

    public async Task<FopApplication?> GetByApplicationNumberAsync(
        string applicationNumber,
        CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Include(a => a.Documents)
            .Include(a => a.Payment)
            .FirstOrDefaultAsync(a => a.ApplicationNumber == applicationNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<FopApplication>> GetByOperatorIdAsync(
        Guid operatorId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Where(a => a.OperatorId == operatorId)
            .Include(a => a.Documents)
            .Include(a => a.Payment)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FopApplication>> GetByStatusAsync(
        ApplicationStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Where(a => a.Status == status)
            .Include(a => a.Documents)
            .Include(a => a.Payment)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FopApplication>> GetByStatusesAsync(
        IEnumerable<ApplicationStatus> statuses,
        CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Where(a => statuses.Contains(a.Status))
            .Include(a => a.Documents)
            .Include(a => a.Payment)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<FopApplication> Items, int TotalCount)> GetPagedAsync(
        ApplicationStatus[]? statuses = null,
        ApplicationType[]? types = null,
        Guid? operatorId = null,
        DateTime? submittedFrom = null,
        DateTime? submittedTo = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Applications.AsQueryable();

        if (statuses is { Length: > 0 })
        {
            query = query.Where(a => statuses.Contains(a.Status));
        }

        if (types is { Length: > 0 })
        {
            query = query.Where(a => types.Contains(a.Type));
        }

        if (operatorId.HasValue)
        {
            query = query.Where(a => a.OperatorId == operatorId.Value);
        }

        if (submittedFrom.HasValue)
        {
            query = query.Where(a => a.SubmittedAt >= submittedFrom.Value);
        }

        if (submittedTo.HasValue)
        {
            query = query.Where(a => a.SubmittedAt <= submittedTo.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a =>
                a.ApplicationNumber.Contains(search) ||
                a.FlightDetails.ArrivalAirport.Contains(search) ||
                a.FlightDetails.DepartureAirport.Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(a => a.Documents)
            .Include(a => a.Payment)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
