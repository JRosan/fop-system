using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public sealed record PaymentDto(
    Guid Id,
    Guid ApplicationId,
    MoneyDto Amount,
    PaymentMethod Method,
    PaymentStatus Status,
    string? TransactionReference,
    DateTime? PaymentDate,
    string? ReceiptNumber,
    string? ReceiptUrl,
    string? FailureReason,
    bool IsVerified,
    string? VerifiedBy,
    DateTime? VerifiedAt,
    string? VerificationNotes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record PaymentSummaryDto(
    Guid Id,
    Guid ApplicationId,
    MoneyDto Amount,
    PaymentStatus Status,
    DateTime? PaymentDate,
    string? ReceiptNumber);
