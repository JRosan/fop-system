using FopSystem.Domain.Entities;

namespace FopSystem.Domain.Repositories;

public interface IFeeConfigurationRepository
{
    Task<FeeConfiguration?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FeeConfiguration?> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FeeConfiguration>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<FeeConfiguration> Items, int TotalCount)> GetPagedAsync(
        bool? isActive = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
    void Add(FeeConfiguration configuration);
    void Remove(FeeConfiguration configuration);
}
