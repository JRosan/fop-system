using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class OperatorAccountBalanceRepository : IOperatorAccountBalanceRepository
{
    private readonly FopDbContext _context;

    public OperatorAccountBalanceRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<OperatorAccountBalance?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.OperatorAccountBalances.FindAsync([id], cancellationToken);
    }

    public async Task<IReadOnlyList<OperatorAccountBalance>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OperatorAccountBalances.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(OperatorAccountBalance entity, CancellationToken cancellationToken = default)
    {
        await _context.OperatorAccountBalances.AddAsync(entity, cancellationToken);
    }

    public void Update(OperatorAccountBalance entity)
    {
        _context.OperatorAccountBalances.Update(entity);
    }

    public void Remove(OperatorAccountBalance entity)
    {
        _context.OperatorAccountBalances.Remove(entity);
    }

    public async Task<OperatorAccountBalance?> GetByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default)
    {
        return await _context.OperatorAccountBalances
            .FirstOrDefaultAsync(b => b.OperatorId == operatorId, cancellationToken);
    }

    public async Task<IReadOnlyList<OperatorAccountBalance>> GetWithOverdueDebtAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OperatorAccountBalances
            .Where(b => b.TotalOverdue.Amount > 0)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<OperatorAccountBalance>> GetWithOutstandingBalanceAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OperatorAccountBalances
            .Where(b => b.CurrentBalance.Amount > 0)
            .ToListAsync(cancellationToken);
    }

    public async Task<OperatorAccountBalance> GetOrCreateAsync(Guid operatorId, CancellationToken cancellationToken = default)
    {
        var existing = await GetByOperatorIdAsync(operatorId, cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var newBalance = OperatorAccountBalance.Create(operatorId);
        await AddAsync(newBalance, cancellationToken);
        return newBalance;
    }
}
