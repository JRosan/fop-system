using FopSystem.Domain.Entities;

namespace FopSystem.Domain.Repositories;

public interface IAuditLogRepository
{
    Task<AuditLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<AuditLog> Items, int TotalCount)> GetPagedAsync(
        string? entityType = null,
        Guid? entityId = null,
        string? action = null,
        string? userId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByEntityAsync(
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken = default);

    void Add(AuditLog auditLog);
}
