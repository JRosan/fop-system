using FopSystem.Application.Common;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Dashboard.Queries;

public sealed record GetFinanceDashboardQuery : IQuery<FinanceDashboardDto>;

public sealed record FinanceDashboardDto(
    decimal TodayRevenue,
    decimal WeekRevenue,
    decimal MonthRevenue,
    int PendingPayments,
    int CompletedPaymentsToday,
    int RefundsThisMonth,
    IReadOnlyList<PendingPaymentDto> PendingPaymentsList,
    IReadOnlyList<RecentTransactionDto> RecentTransactions);

public sealed record PendingPaymentDto(
    Guid ApplicationId,
    string ApplicationNumber,
    string OperatorName,
    decimal Amount,
    DateTime RequestedAt);

public sealed record RecentTransactionDto(
    Guid ApplicationId,
    string ApplicationNumber,
    string Type,
    decimal Amount,
    DateTime TransactionDate);

public sealed class GetFinanceDashboardQueryHandler : IQueryHandler<GetFinanceDashboardQuery, FinanceDashboardDto>
{
    private readonly IApplicationRepository _applicationRepository;

    public GetFinanceDashboardQueryHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result<FinanceDashboardDto>> Handle(
        GetFinanceDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek);
        var monthStart = new DateTime(today.Year, today.Month, 1);

        // Get all applications with payments
        var (allApps, _) = await _applicationRepository.GetPagedAsync(
            pageSize: 1000,
            cancellationToken: cancellationToken);

        var appsWithPayments = allApps
            .Where(a => a.Payment is not null)
            .Select(a => new { Application = a, Payment = a.Payment! })
            .ToList();

        var completedPayments = appsWithPayments
            .Where(x => x.Payment.Status == PaymentStatus.Completed)
            .ToList();

        var todayRevenue = completedPayments
            .Where(x => x.Payment.PaymentDate?.Date == today)
            .Sum(x => x.Payment.Amount.Amount);

        var weekRevenue = completedPayments
            .Where(x => x.Payment.PaymentDate >= weekStart)
            .Sum(x => x.Payment.Amount.Amount);

        var monthRevenue = completedPayments
            .Where(x => x.Payment.PaymentDate >= monthStart)
            .Sum(x => x.Payment.Amount.Amount);

        var completedToday = completedPayments
            .Count(x => x.Payment.PaymentDate?.Date == today);

        var refundedCount = appsWithPayments
            .Count(x => x.Payment.Status == PaymentStatus.Refunded && x.Payment.PaymentDate >= monthStart);

        // Get pending payments
        var (pendingApps, pendingCount) = await _applicationRepository.GetPagedAsync(
            statuses: [ApplicationStatus.PendingPayment],
            pageSize: 100,
            cancellationToken: cancellationToken);

        var pendingPaymentsList = pendingApps
            .Take(10)
            .Select(a => new PendingPaymentDto(
                a.Id,
                a.ApplicationNumber,
                a.Operator?.Name ?? "Unknown",
                a.CalculatedFee.Amount,
                a.UpdatedAt))
            .ToList();

        // Recent transactions
        var recentTransactions = completedPayments
            .OrderByDescending(x => x.Payment.PaymentDate)
            .Take(10)
            .Select(x => new RecentTransactionDto(
                x.Application.Id,
                x.Application.ApplicationNumber,
                "Payment",
                x.Payment.Amount.Amount,
                x.Payment.PaymentDate ?? DateTime.UtcNow))
            .ToList();

        return Result.Success(new FinanceDashboardDto(
            todayRevenue,
            weekRevenue,
            monthRevenue,
            pendingCount,
            completedToday,
            refundedCount,
            pendingPaymentsList,
            recentTransactions));
    }
}
