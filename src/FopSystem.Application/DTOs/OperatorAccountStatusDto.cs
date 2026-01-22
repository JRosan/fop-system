namespace FopSystem.Application.DTOs;

public sealed record OperatorAccountStatusDto(
    Guid OperatorId,
    MoneyDto TotalInvoiced,
    MoneyDto TotalPaid,
    MoneyDto TotalInterest,
    MoneyDto CurrentBalance,
    MoneyDto TotalOverdue,
    int InvoiceCount,
    int PaidInvoiceCount,
    int OverdueInvoiceCount,
    DateTime? LastInvoiceDate,
    DateTime? LastPaymentDate,
    bool HasOutstandingDebt,
    bool HasOverdueDebt,
    bool IsEligibleForPermitIssuance);

public sealed record PermitIssuanceEligibilityDto(
    bool IsEligible,
    MoneyDto OutstandingDebt,
    int OverdueInvoiceCount,
    IReadOnlyList<string> BlockReasons);
