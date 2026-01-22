using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Repositories;

public interface IPermitRepository : IRepository<Permit, Guid>
{
    Task<Permit?> GetByPermitNumberAsync(string permitNumber, CancellationToken cancellationToken = default);

    Task<Permit?> GetByApplicationIdAsync(Guid applicationId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Permit>> GetByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Permit>> GetByStatusAsync(PermitStatus status, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Permit>> GetExpiringPermitsAsync(DateOnly asOfDate, int daysThreshold, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Permit>> GetExpiredPermitsAsync(DateOnly asOfDate, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Permit> Items, int TotalCount)> GetPagedAsync(
        PermitStatus[]? statuses = null,
        ApplicationType[]? types = null,
        Guid? operatorId = null,
        DateTime? issuedFrom = null,
        DateTime? issuedTo = null,
        int? expiringWithinDays = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
}
