using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Reports.Queries;

public sealed record GetFinancialReportQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    ApplicationType? Type = null) : IQuery<FinancialReportDto>;

public sealed record FinancialReportDto(
    DateTime ReportGeneratedAt,
    DateTime? FromDate,
    DateTime? ToDate,
    FinancialSummaryDto Summary,
    IReadOnlyList<PaymentReportItemDto> Payments,
    IReadOnlyList<RefundReportItemDto> Refunds,
    IReadOnlyList<RevenueByTypeDto> RevenueByType,
    IReadOnlyList<RevenueByMonthDto> RevenueByMonth);

public sealed record FinancialSummaryDto(
    decimal TotalRevenue,
    decimal TotalRefunds,
    decimal NetRevenue,
    int TotalPayments,
    int TotalRefundsCount,
    int PendingPayments,
    decimal PendingAmount,
    string Currency);

public sealed record PaymentReportItemDto(
    Guid PaymentId,
    Guid ApplicationId,
    string ApplicationNumber,
    string OperatorName,
    ApplicationType ApplicationType,
    decimal Amount,
    string Currency,
    PaymentMethod Method,
    PaymentStatus Status,
    DateTime? PaymentDate,
    string? ReceiptNumber);

public sealed record RefundReportItemDto(
    Guid PaymentId,
    Guid ApplicationId,
    string ApplicationNumber,
    string OperatorName,
    decimal Amount,
    string Currency,
    DateTime RefundedAt);

public sealed record RevenueByTypeDto(
    ApplicationType Type,
    int Count,
    decimal TotalAmount,
    string Currency);

public sealed record RevenueByMonthDto(
    int Year,
    int Month,
    int PaymentCount,
    decimal Revenue,
    decimal Refunds,
    decimal NetRevenue,
    string Currency);

public sealed class GetFinancialReportQueryHandler : IQueryHandler<GetFinancialReportQuery, FinancialReportDto>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;

    public GetFinancialReportQueryHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
    }

    public async Task<Result<FinancialReportDto>> Handle(
        GetFinancialReportQuery request,
        CancellationToken cancellationToken)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddYears(-1);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        // Get all applications with payments in the date range
        var (applications, _) = await _applicationRepository.GetPagedAsync(
            statuses: null,
            types: request.Type is not null ? [request.Type.Value] : null,
            operatorId: null,
            submittedFrom: fromDate,
            submittedTo: toDate,
            search: null,
            pageNumber: 1,
            pageSize: 10000,
            cancellationToken: cancellationToken);

        var applicationsWithPayments = applications
            .Where(a => a.Payment is not null)
            .ToList();

        // Get operators for display
        var operatorIds = applicationsWithPayments.Select(a => a.OperatorId).Distinct().ToList();
        var operators = new Dictionary<Guid, string>();
        foreach (var id in operatorIds)
        {
            var op = await _operatorRepository.GetByIdAsync(id, cancellationToken);
            if (op is not null) operators[id] = op.Name;
        }

        // Build payment items
        var completedPayments = applicationsWithPayments
            .Where(a => a.Payment!.Status == PaymentStatus.Completed || a.Payment.Status == PaymentStatus.Refunded)
            .Select(a => new PaymentReportItemDto(
                a.Payment!.Id,
                a.Id,
                a.ApplicationNumber,
                operators.GetValueOrDefault(a.OperatorId, "Unknown"),
                a.Type,
                a.Payment.Amount.Amount,
                a.Payment.Amount.Currency.ToString(),
                a.Payment.Method,
                a.Payment.Status,
                a.Payment.PaymentDate,
                a.Payment.ReceiptNumber))
            .ToList();

        // Build refund items
        var refunds = applicationsWithPayments
            .Where(a => a.Payment!.Status == PaymentStatus.Refunded)
            .Select(a => new RefundReportItemDto(
                a.Payment!.Id,
                a.Id,
                a.ApplicationNumber,
                operators.GetValueOrDefault(a.OperatorId, "Unknown"),
                a.Payment.Amount.Amount,
                a.Payment.Amount.Currency.ToString(),
                a.Payment.UpdatedAt))
            .ToList();

        // Calculate summary
        var totalRevenue = completedPayments
            .Where(p => p.Status == PaymentStatus.Completed)
            .Sum(p => p.Amount);
        var totalRefunds = refunds.Sum(r => r.Amount);
        var pendingPayments = applicationsWithPayments
            .Where(a => a.Payment!.Status == PaymentStatus.Pending || a.Payment.Status == PaymentStatus.Processing)
            .ToList();

        var summary = new FinancialSummaryDto(
            totalRevenue,
            totalRefunds,
            totalRevenue - totalRefunds,
            completedPayments.Count(p => p.Status == PaymentStatus.Completed),
            refunds.Count,
            pendingPayments.Count,
            pendingPayments.Sum(a => a.Payment!.Amount.Amount),
            "USD");

        // Revenue by type
        var revenueByType = completedPayments
            .Where(p => p.Status == PaymentStatus.Completed)
            .GroupBy(p => p.ApplicationType)
            .Select(g => new RevenueByTypeDto(
                g.Key,
                g.Count(),
                g.Sum(p => p.Amount),
                "USD"))
            .ToList();

        // Revenue by month
        var revenueByMonth = completedPayments
            .Where(p => p.PaymentDate.HasValue)
            .GroupBy(p => new { p.PaymentDate!.Value.Year, p.PaymentDate!.Value.Month })
            .Select(g =>
            {
                var monthRefunds = refunds
                    .Where(r => r.RefundedAt.Year == g.Key.Year && r.RefundedAt.Month == g.Key.Month)
                    .Sum(r => r.Amount);
                var monthRevenue = g.Sum(p => p.Amount);
                return new RevenueByMonthDto(
                    g.Key.Year,
                    g.Key.Month,
                    g.Count(),
                    monthRevenue,
                    monthRefunds,
                    monthRevenue - monthRefunds,
                    "USD");
            })
            .OrderByDescending(r => r.Year)
            .ThenByDescending(r => r.Month)
            .ToList();

        return Result.Success(new FinancialReportDto(
            DateTime.UtcNow,
            request.FromDate,
            request.ToDate,
            summary,
            completedPayments,
            refunds,
            revenueByType,
            revenueByMonth));
    }
}
