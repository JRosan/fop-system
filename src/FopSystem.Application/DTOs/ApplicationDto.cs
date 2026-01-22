using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public sealed record ApplicationDto(
    Guid Id,
    string ApplicationNumber,
    ApplicationType Type,
    ApplicationStatus Status,
    OperatorSummaryDto Operator,
    AircraftSummaryDto Aircraft,
    FlightDetailsDto FlightDetails,
    DateOnly RequestedStartDate,
    DateOnly RequestedEndDate,
    MoneyDto CalculatedFee,
    IReadOnlyList<DocumentSummaryDto> Documents,
    PaymentDto? Payment,
    DateTime? SubmittedAt,
    DateTime? ReviewedAt,
    string? ReviewedBy,
    string? ReviewNotes,
    DateTime? ApprovedAt,
    string? ApprovedBy,
    string? RejectionReason,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record ApplicationSummaryDto(
    Guid Id,
    string ApplicationNumber,
    ApplicationType Type,
    ApplicationStatus Status,
    string OperatorName,
    string AircraftRegistration,
    MoneyDto CalculatedFee,
    DateTime? SubmittedAt,
    DateTime CreatedAt);

public sealed record FlightDetailsDto(
    FlightPurpose Purpose,
    string? PurposeDescription,
    string ArrivalAirport,
    string DepartureAirport,
    DateOnly EstimatedFlightDate,
    int? NumberOfPassengers,
    string? CargoDescription);

public sealed record MoneyDto(decimal Amount, string Currency);
