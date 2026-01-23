using FopSystem.Domain.Aggregates.Field;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class AirportServiceLogRepository : IAirportServiceLogRepository
{
    private readonly FopDbContext _context;

    public AirportServiceLogRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<AirportServiceLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.AirportServiceLogs
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<AirportServiceLog?> GetByLogNumberAsync(string logNumber, CancellationToken cancellationToken = default)
    {
        return await _context.AirportServiceLogs
            .FirstOrDefaultAsync(l => l.LogNumber == logNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<AirportServiceLog>> GetByOfficerIdAsync(
        Guid officerId,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.AirportServiceLogs
            .Where(l => l.OfficerId == officerId);

        if (fromDate.HasValue)
        {
            var fromDateTime = fromDate.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(l => l.LoggedAt >= fromDateTime);
        }

        if (toDate.HasValue)
        {
            var toDateTime = toDate.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(l => l.LoggedAt <= toDateTime);
        }

        return await query
            .OrderByDescending(l => l.LoggedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AirportServiceLog>> GetByPermitIdAsync(
        Guid permitId,
        CancellationToken cancellationToken = default)
    {
        return await _context.AirportServiceLogs
            .Where(l => l.PermitId == permitId)
            .OrderByDescending(l => l.LoggedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AirportServiceLog>> GetPendingForInvoicingAsync(
        Guid? operatorId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.AirportServiceLogs
            .Where(l => l.Status == AirportServiceLogStatus.Pending);

        if (operatorId.HasValue)
        {
            query = query.Where(l => l.OperatorId == operatorId.Value);
        }

        return await query
            .OrderBy(l => l.LoggedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<AirportServiceLog> Items, int TotalCount)> GetPagedAsync(
        Guid? operatorId = null,
        Guid? officerId = null,
        AirportServiceLogStatus[]? statuses = null,
        BviAirport? airport = null,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.AirportServiceLogs.AsQueryable();

        if (operatorId.HasValue)
            query = query.Where(l => l.OperatorId == operatorId.Value);

        if (officerId.HasValue)
            query = query.Where(l => l.OfficerId == officerId.Value);

        if (statuses?.Length > 0)
            query = query.Where(l => statuses.Contains(l.Status));

        if (airport.HasValue)
            query = query.Where(l => l.Airport == airport.Value);

        if (fromDate.HasValue)
        {
            var fromDateTime = fromDate.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(l => l.LoggedAt >= fromDateTime);
        }

        if (toDate.HasValue)
        {
            var toDateTime = toDate.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(l => l.LoggedAt <= toDateTime);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(l => l.LoggedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<AirportServiceLog>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AirportServiceLogs
            .OrderByDescending(l => l.LoggedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(AirportServiceLog entity, CancellationToken cancellationToken = default)
    {
        await _context.AirportServiceLogs.AddAsync(entity, cancellationToken);
    }

    public void Update(AirportServiceLog entity)
    {
        _context.AirportServiceLogs.Update(entity);
    }

    public void Remove(AirportServiceLog entity)
    {
        _context.AirportServiceLogs.Remove(entity);
    }
}

public class FieldVerificationLogRepository : IFieldVerificationLogRepository
{
    private readonly FopDbContext _context;

    public FieldVerificationLogRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<FieldVerificationLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.FieldVerificationLogs
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<FieldVerificationLog>> GetByOfficerIdAsync(
        Guid officerId,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.FieldVerificationLogs
            .Where(l => l.OfficerId == officerId);

        if (fromDate.HasValue)
        {
            var fromDateTime = fromDate.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(l => l.VerifiedAt >= fromDateTime);
        }

        if (toDate.HasValue)
        {
            var toDateTime = toDate.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(l => l.VerifiedAt <= toDateTime);
        }

        return await query
            .OrderByDescending(l => l.VerifiedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FieldVerificationLog>> GetByPermitIdAsync(
        Guid permitId,
        CancellationToken cancellationToken = default)
    {
        return await _context.FieldVerificationLogs
            .Where(l => l.PermitId == permitId)
            .OrderByDescending(l => l.VerifiedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<FieldVerificationLog> Items, int TotalCount)> GetPagedAsync(
        Guid? officerId = null,
        VerificationResult[]? results = null,
        BviAirport? airport = null,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.FieldVerificationLogs.AsQueryable();

        if (officerId.HasValue)
            query = query.Where(l => l.OfficerId == officerId.Value);

        if (results?.Length > 0)
            query = query.Where(l => results.Contains(l.Result));

        if (airport.HasValue)
            query = query.Where(l => l.Airport == airport.Value);

        if (fromDate.HasValue)
        {
            var fromDateTime = fromDate.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(l => l.VerifiedAt >= fromDateTime);
        }

        if (toDate.HasValue)
        {
            var toDateTime = toDate.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(l => l.VerifiedAt <= toDateTime);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(l => l.VerifiedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<FieldVerificationLog>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FieldVerificationLogs
            .OrderByDescending(l => l.VerifiedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(FieldVerificationLog entity, CancellationToken cancellationToken = default)
    {
        await _context.FieldVerificationLogs.AddAsync(entity, cancellationToken);
    }

    public void Update(FieldVerificationLog entity)
    {
        _context.FieldVerificationLogs.Update(entity);
    }

    public void Remove(FieldVerificationLog entity)
    {
        _context.FieldVerificationLogs.Remove(entity);
    }
}

public class TelemetryEventRepository : ITelemetryEventRepository
{
    private readonly FopDbContext _context;

    public TelemetryEventRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<TelemetryEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.TelemetryEvents
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<TelemetryEvent> Items, int TotalCount)> GetPagedAsync(
        TelemetryEventType[]? eventTypes = null,
        Guid? userId = null,
        string? deviceId = null,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.TelemetryEvents.AsQueryable();

        if (eventTypes?.Length > 0)
            query = query.Where(e => eventTypes.Contains(e.EventType));

        if (userId.HasValue)
            query = query.Where(e => e.UserId == userId.Value);

        if (!string.IsNullOrEmpty(deviceId))
            query = query.Where(e => e.DeviceId == deviceId);

        if (fromDate.HasValue)
        {
            var fromDateTime = fromDate.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(e => e.OccurredAt >= fromDateTime);
        }

        if (toDate.HasValue)
        {
            var toDateTime = toDate.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(e => e.OccurredAt <= toDateTime);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(e => e.OccurredAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(TelemetryEvent entity, CancellationToken cancellationToken = default)
    {
        await _context.TelemetryEvents.AddAsync(entity, cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<TelemetryEvent> entities, CancellationToken cancellationToken = default)
    {
        await _context.TelemetryEvents.AddRangeAsync(entities, cancellationToken);
    }
}
