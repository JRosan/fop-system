using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Events;

public sealed record ApplicationCreatedEvent(
    Guid ApplicationId,
    string ApplicationNumber,
    ApplicationType Type,
    Guid OperatorId,
    Guid AircraftId) : DomainEvent;

public sealed record ApplicationSubmittedEvent(
    Guid ApplicationId,
    string ApplicationNumber,
    Money CalculatedFee) : DomainEvent;

public sealed record ApplicationUnderReviewEvent(
    Guid ApplicationId,
    string ReviewerUserId) : DomainEvent;

public sealed record DocumentVerifiedEvent(
    Guid ApplicationId,
    Guid DocumentId,
    DocumentType DocumentType,
    string VerifiedBy) : DomainEvent;

public sealed record DocumentRejectedEvent(
    Guid ApplicationId,
    Guid DocumentId,
    DocumentType DocumentType,
    string Reason,
    string RejectedBy) : DomainEvent;

public sealed record PaymentCompletedEvent(
    Guid ApplicationId,
    Guid PaymentId,
    Money Amount,
    string TransactionReference) : DomainEvent;

public sealed record ApplicationApprovedEvent(
    Guid ApplicationId,
    string ApplicationNumber,
    string ApprovedBy,
    string? Notes) : DomainEvent;

public sealed record ApplicationRejectedEvent(
    Guid ApplicationId,
    string ApplicationNumber,
    string RejectedBy,
    string Reason) : DomainEvent;

public sealed record PermitIssuedEvent(
    Guid ApplicationId,
    Guid PermitId,
    string PermitNumber,
    DateOnly ValidFrom,
    DateOnly ValidUntil) : DomainEvent;

public sealed record InsuranceExpiringEvent(
    Guid ApplicationId,
    Guid PermitId,
    string OperatorEmail,
    DateOnly ExpiryDate,
    int DaysUntilExpiry) : DomainEvent;
