using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Events;

public sealed record BviaInvoiceCreatedEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid OperatorId,
    Guid? FopApplicationId) : DomainEvent;

public sealed record BviaInvoiceFinalizedEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Money TotalAmount,
    Guid OperatorId) : DomainEvent;

public sealed record BviaInvoicePaidEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid OperatorId) : DomainEvent;

public sealed record BviaInvoiceOverdueEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Money BalanceDue,
    Guid OperatorId) : DomainEvent;

public sealed record BviaPaymentReceivedEvent(
    Guid PaymentId,
    Guid InvoiceId,
    string InvoiceNumber,
    Money Amount,
    Guid OperatorId) : DomainEvent;

public sealed record BviaInterestChargedEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Money InterestAmount,
    int DaysOverdue,
    Guid OperatorId) : DomainEvent;

public sealed record BviaInvoiceCancelledEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    string CancelledBy,
    string Reason,
    Guid OperatorId) : DomainEvent;

public sealed record BviaFeeRateCreatedEvent(
    Guid FeeRateId,
    string Category,
    Money Rate) : DomainEvent;

public sealed record BviaFeeRateDeactivatedEvent(
    Guid FeeRateId,
    string Category,
    DateOnly EffectiveTo) : DomainEvent;

public sealed record OperatorAccountBalanceUpdatedEvent(
    Guid OperatorId,
    Money CurrentBalance,
    Money TotalOverdue,
    bool IsEligibleForPermit) : DomainEvent;

public sealed record PermitIssuanceBlockedEvent(
    Guid ApplicationId,
    Guid OperatorId,
    Money OutstandingDebt,
    int OverdueInvoiceCount) : DomainEvent;
