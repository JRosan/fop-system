using FopSystem.Domain.Aggregates.Aircraft;

namespace FopSystem.Domain.Repositories;

public interface IAircraftRepository : IRepository<Aircraft, Guid>
{
    Task<Aircraft?> GetByRegistrationMarkAsync(string registrationMark, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Aircraft>> GetByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Aircraft> Items, int TotalCount)> GetPagedAsync(
        Guid? operatorId = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string registrationMark, CancellationToken cancellationToken = default);
}
