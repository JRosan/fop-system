using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Revenue.Queries;

public sealed record GetOperatorAccountStatusQuery(Guid OperatorId) : IQuery<OperatorAccountStatusDto>;

public sealed class GetOperatorAccountStatusQueryHandler : IQueryHandler<GetOperatorAccountStatusQuery, OperatorAccountStatusDto>
{
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;

    public GetOperatorAccountStatusQueryHandler(IOperatorAccountBalanceRepository accountBalanceRepository)
    {
        _accountBalanceRepository = accountBalanceRepository;
    }

    public async Task<Result<OperatorAccountStatusDto>> Handle(GetOperatorAccountStatusQuery request, CancellationToken cancellationToken)
    {
        var balance = await _accountBalanceRepository.GetByOperatorIdAsync(request.OperatorId, cancellationToken);

        if (balance is null)
        {
            // Return a zero balance for operators with no history
            return Result.Success(new OperatorAccountStatusDto(
                OperatorId: request.OperatorId,
                TotalInvoiced: new MoneyDto(0, "USD"),
                TotalPaid: new MoneyDto(0, "USD"),
                TotalInterest: new MoneyDto(0, "USD"),
                CurrentBalance: new MoneyDto(0, "USD"),
                TotalOverdue: new MoneyDto(0, "USD"),
                InvoiceCount: 0,
                PaidInvoiceCount: 0,
                OverdueInvoiceCount: 0,
                LastInvoiceDate: null,
                LastPaymentDate: null,
                HasOutstandingDebt: false,
                HasOverdueDebt: false,
                IsEligibleForPermitIssuance: true));
        }

        return Result.Success(new OperatorAccountStatusDto(
            OperatorId: balance.OperatorId,
            TotalInvoiced: new MoneyDto(balance.TotalInvoiced.Amount, balance.TotalInvoiced.Currency.ToString()),
            TotalPaid: new MoneyDto(balance.TotalPaid.Amount, balance.TotalPaid.Currency.ToString()),
            TotalInterest: new MoneyDto(balance.TotalInterest.Amount, balance.TotalInterest.Currency.ToString()),
            CurrentBalance: new MoneyDto(balance.CurrentBalance.Amount, balance.CurrentBalance.Currency.ToString()),
            TotalOverdue: new MoneyDto(balance.TotalOverdue.Amount, balance.TotalOverdue.Currency.ToString()),
            InvoiceCount: balance.InvoiceCount,
            PaidInvoiceCount: balance.PaidInvoiceCount,
            OverdueInvoiceCount: balance.OverdueInvoiceCount,
            LastInvoiceDate: balance.LastInvoiceDate,
            LastPaymentDate: balance.LastPaymentDate,
            HasOutstandingDebt: balance.HasOutstandingDebt,
            HasOverdueDebt: balance.HasOverdueDebt,
            IsEligibleForPermitIssuance: balance.IsEligibleForPermitIssuance));
    }
}
