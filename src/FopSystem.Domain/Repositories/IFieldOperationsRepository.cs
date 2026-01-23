using FopSystem.Domain.Aggregates.Field;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Repositories;

public interface IAirportServiceLogRepository : IRepository<AirportServiceLog, Guid>
{
    Task<AirportServiceLog?> GetByLogNumberAsync(string logNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AirportServiceLog>> GetByOfficerIdAsync(
        Guid officerId,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AirportServiceLog>> GetByPermitIdAsync(
        Guid permitId,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AirportServiceLog>> GetPendingForInvoicingAsync(
        Guid? operatorId = null,
        CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<AirportServiceLog> Items, int TotalCount)> GetPagedAsync(
        Guid? operatorId = null,
        Guid? officerId = null,
        AirportServiceLogStatus[]? statuses = null,
        BviAirport? airport = null,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
}

public interface IFieldVerificationLogRepository : IRepository<FieldVerificationLog, Guid>
{
    Task<IReadOnlyList<FieldVerificationLog>> GetByOfficerIdAsync(
        Guid officerId,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FieldVerificationLog>> GetByPermitIdAsync(
        Guid permitId,
        CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<FieldVerificationLog> Items, int TotalCount)> GetPagedAsync(
        Guid? officerId = null,
        VerificationResult[]? results = null,
        BviAirport? airport = null,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
}

public interface ITelemetryEventRepository
{
    Task<TelemetryEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<TelemetryEvent> Items, int TotalCount)> GetPagedAsync(
        TelemetryEventType[]? eventTypes = null,
        Guid? userId = null,
        string? deviceId = null,
        DateOnly? fromDate = null,
        DateOnly? toDate = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
    Task AddAsync(TelemetryEvent entity, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<TelemetryEvent> entities, CancellationToken cancellationToken = default);
}
