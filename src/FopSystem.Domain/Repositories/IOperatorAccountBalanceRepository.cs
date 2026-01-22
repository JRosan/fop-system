using FopSystem.Domain.Aggregates.Revenue;

namespace FopSystem.Domain.Repositories;

public interface IOperatorAccountBalanceRepository : IRepository<OperatorAccountBalance, Guid>
{
    Task<OperatorAccountBalance?> GetByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OperatorAccountBalance>> GetWithOverdueDebtAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OperatorAccountBalance>> GetWithOutstandingBalanceAsync(CancellationToken cancellationToken = default);

    Task<OperatorAccountBalance> GetOrCreateAsync(Guid operatorId, CancellationToken cancellationToken = default);
}
