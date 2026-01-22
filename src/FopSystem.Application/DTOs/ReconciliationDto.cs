namespace FopSystem.Application.DTOs;

public sealed record ReconciliationReportDto(
    DateTime GeneratedAt,
    DateOnly PeriodStart,
    DateOnly PeriodEnd,
    ReconciliationSummaryDto Summary,
    IReadOnlyList<PaymentReconciliationItemDto> VerifiedPayments,
    IReadOnlyList<PaymentReconciliationItemDto> UnverifiedPayments,
    IReadOnlyList<PaymentReconciliationItemDto> PendingPayments,
    IReadOnlyList<PaymentReconciliationItemDto> RefundedPayments);

public sealed record ReconciliationSummaryDto(
    int TotalPayments,
    int VerifiedCount,
    int UnverifiedCount,
    int PendingCount,
    int RefundedCount,
    decimal TotalCollected,
    decimal TotalVerified,
    decimal TotalUnverified,
    decimal TotalPending,
    decimal TotalRefunded,
    string Currency);

public sealed record PaymentReconciliationItemDto(
    Guid PaymentId,
    Guid ApplicationId,
    string ApplicationNumber,
    string OperatorName,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    DateTime? PaymentDate,
    string? TransactionReference,
    string? ReceiptNumber,
    bool IsVerified,
    string? VerifiedBy,
    DateTime? VerifiedAt);
