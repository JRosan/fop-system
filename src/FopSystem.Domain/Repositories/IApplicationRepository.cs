using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Repositories;

public interface IApplicationRepository : IRepository<FopApplication, Guid>
{
    Task<FopApplication?> GetByApplicationNumberAsync(string applicationNumber, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FopApplication>> GetByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FopApplication>> GetByStatusAsync(ApplicationStatus status, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FopApplication>> GetByStatusesAsync(IEnumerable<ApplicationStatus> statuses, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<FopApplication> Items, int TotalCount)> GetPagedAsync(
        ApplicationStatus[]? statuses = null,
        ApplicationType[]? types = null,
        Guid? operatorId = null,
        DateTime? submittedFrom = null,
        DateTime? submittedTo = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        bool? isFlagged = null,
        CancellationToken cancellationToken = default);
}
