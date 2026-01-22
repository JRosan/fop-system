using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.DTOs;

public sealed record BviaFeeRateDto(
    Guid Id,
    BviaFeeCategory Category,
    FlightOperationType OperationType,
    BviAirport? Airport,
    string? MtowTier,
    MoneyDto Rate,
    bool IsPerUnit,
    string? UnitDescription,
    MoneyDto? MinimumFee,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);
