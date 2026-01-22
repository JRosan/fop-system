using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public sealed record PermitDto(
    Guid Id,
    string PermitNumber,
    Guid ApplicationId,
    string ApplicationNumber,
    ApplicationType Type,
    PermitStatus Status,
    Guid OperatorId,
    string OperatorName,
    Guid AircraftId,
    string AircraftRegistration,
    DateOnly ValidFrom,
    DateOnly ValidUntil,
    DateTime IssuedAt,
    string IssuedBy,
    IReadOnlyList<string> Conditions,
    MoneyDto FeesPaid,
    string? DocumentUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record PermitSummaryDto(
    Guid Id,
    string PermitNumber,
    ApplicationType Type,
    PermitStatus Status,
    string OperatorName,
    string AircraftRegistration,
    DateOnly ValidFrom,
    DateOnly ValidUntil,
    DateTime IssuedAt);

public sealed record PermitVerificationDto(
    bool IsValid,
    PermitDto? Permit,
    string Message);
