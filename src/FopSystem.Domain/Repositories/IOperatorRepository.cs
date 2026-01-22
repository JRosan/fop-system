using FopSystem.Domain.Aggregates.Operator;

namespace FopSystem.Domain.Repositories;

public interface IOperatorRepository : IRepository<Operator, Guid>
{
    Task<Operator?> GetByRegistrationNumberAsync(string registrationNumber, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Operator>> GetByCountryAsync(string country, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Operator> Items, int TotalCount)> GetPagedAsync(
        string? country = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string registrationNumber, CancellationToken cancellationToken = default);
}
