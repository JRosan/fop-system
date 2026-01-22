using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public sealed record AircraftDto(
    Guid Id,
    string RegistrationMark,
    string Manufacturer,
    string Model,
    string SerialNumber,
    AircraftCategory Category,
    WeightDto Mtow,
    int SeatCount,
    int YearOfManufacture,
    string? NoiseCategory,
    Guid OperatorId,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record AircraftSummaryDto(
    Guid Id,
    string RegistrationMark,
    string Manufacturer,
    string Model,
    WeightDto Mtow,
    int SeatCount);

public sealed record WeightDto(decimal Value, string Unit);
