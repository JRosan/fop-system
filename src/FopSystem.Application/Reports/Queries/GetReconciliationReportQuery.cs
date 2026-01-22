using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Reports.Queries;

public sealed record GetReconciliationReportQuery(
    DateOnly PeriodStart,
    DateOnly PeriodEnd) : IQuery<ReconciliationReportDto>;

public sealed class GetReconciliationReportQueryValidator : AbstractValidator<GetReconciliationReportQuery>
{
    public GetReconciliationReportQueryValidator()
    {
        RuleFor(x => x.PeriodStart).NotEmpty();
        RuleFor(x => x.PeriodEnd).NotEmpty();
        RuleFor(x => x.PeriodEnd).GreaterThanOrEqualTo(x => x.PeriodStart)
            .WithMessage("End date must be on or after start date");
    }
}

public sealed class GetReconciliationReportQueryHandler
    : IQueryHandler<GetReconciliationReportQuery, ReconciliationReportDto>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;

    public GetReconciliationReportQueryHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
    }

    public async Task<Result<ReconciliationReportDto>> Handle(
        GetReconciliationReportQuery request,
        CancellationToken cancellationToken)
    {
        var startDateTime = request.PeriodStart.ToDateTime(TimeOnly.MinValue);
        var endDateTime = request.PeriodEnd.ToDateTime(TimeOnly.MaxValue);

        // Get all applications with payments in the date range
        var applications = await _applicationRepository.GetWithPaymentsInPeriodAsync(
            startDateTime, endDateTime, cancellationToken);

        // Get all operator IDs to fetch operator names
        var operatorIds = applications.Select(a => a.OperatorId).Distinct().ToList();
        var operators = await _operatorRepository.GetByIdsAsync(operatorIds, cancellationToken);
        var operatorLookup = operators.ToDictionary(o => o.Id, o => o.Name);

        // Categorize payments
        var verifiedPayments = new List<PaymentReconciliationItemDto>();
        var unverifiedPayments = new List<PaymentReconciliationItemDto>();
        var pendingPayments = new List<PaymentReconciliationItemDto>();
        var refundedPayments = new List<PaymentReconciliationItemDto>();

        foreach (var app in applications.Where(a => a.Payment != null))
        {
            var payment = app.Payment!;
            var operatorName = operatorLookup.GetValueOrDefault(app.OperatorId, "Unknown");

            var item = new PaymentReconciliationItemDto(
                payment.Id,
                app.Id,
                app.ApplicationNumber,
                operatorName,
                payment.Amount.Amount,
                payment.Amount.Currency.ToString(),
                payment.Method.ToString(),
                payment.PaymentDate,
                payment.TransactionReference,
                payment.ReceiptNumber,
                payment.IsVerified,
                payment.VerifiedBy,
                payment.VerifiedAt);

            switch (payment.Status)
            {
                case PaymentStatus.Completed when payment.IsVerified:
                    verifiedPayments.Add(item);
                    break;
                case PaymentStatus.Completed when !payment.IsVerified:
                    unverifiedPayments.Add(item);
                    break;
                case PaymentStatus.Pending or PaymentStatus.Processing:
                    pendingPayments.Add(item);
                    break;
                case PaymentStatus.Refunded:
                    refundedPayments.Add(item);
                    break;
            }
        }

        // Calculate summary
        var currency = verifiedPayments.FirstOrDefault()?.Currency
                       ?? unverifiedPayments.FirstOrDefault()?.Currency
                       ?? pendingPayments.FirstOrDefault()?.Currency
                       ?? "USD";

        var summary = new ReconciliationSummaryDto(
            TotalPayments: verifiedPayments.Count + unverifiedPayments.Count + pendingPayments.Count + refundedPayments.Count,
            VerifiedCount: verifiedPayments.Count,
            UnverifiedCount: unverifiedPayments.Count,
            PendingCount: pendingPayments.Count,
            RefundedCount: refundedPayments.Count,
            TotalCollected: verifiedPayments.Sum(p => p.Amount) + unverifiedPayments.Sum(p => p.Amount),
            TotalVerified: verifiedPayments.Sum(p => p.Amount),
            TotalUnverified: unverifiedPayments.Sum(p => p.Amount),
            TotalPending: pendingPayments.Sum(p => p.Amount),
            TotalRefunded: refundedPayments.Sum(p => p.Amount),
            Currency: currency);

        var report = new ReconciliationReportDto(
            GeneratedAt: DateTime.UtcNow,
            PeriodStart: request.PeriodStart,
            PeriodEnd: request.PeriodEnd,
            Summary: summary,
            VerifiedPayments: verifiedPayments,
            UnverifiedPayments: unverifiedPayments,
            PendingPayments: pendingPayments,
            RefundedPayments: refundedPayments);

        return Result<ReconciliationReportDto>.Success(report);
    }
}
