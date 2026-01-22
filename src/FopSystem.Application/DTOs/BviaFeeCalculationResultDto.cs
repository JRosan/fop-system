using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public sealed record BviaFeeCalculationResultDto(
    MoneyDto TotalFee,
    MoneyDto LandingFee,
    MoneyDto NavigationFee,
    string MtowTier,
    IReadOnlyList<BviaFeeBreakdownItemDto> Breakdown);

public sealed record BviaFeeBreakdownItemDto(
    BviaFeeCategory Category,
    string Description,
    MoneyDto Amount);

public sealed record UnifiedFeeCalculationResultDto(
    MoneyDto FopFees,
    MoneyDto BviaFees,
    MoneyDto GrandTotal,
    IReadOnlyList<FeeBreakdownItemDto> FopBreakdown,
    IReadOnlyList<BviaFeeBreakdownItemDto> BviaBreakdown,
    IReadOnlyList<UnifiedFeeBreakdownItemDto> UnifiedBreakdown);

public sealed record UnifiedFeeBreakdownItemDto(
    string Source,
    string Category,
    string Description,
    MoneyDto Amount);
