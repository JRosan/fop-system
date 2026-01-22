namespace FopSystem.Application.DTOs;

public sealed record FeeCalculationResultDto(
    MoneyDto BaseFee,
    MoneyDto SeatFee,
    MoneyDto WeightFee,
    decimal Multiplier,
    MoneyDto TotalFee,
    IReadOnlyList<FeeBreakdownItemDto> Breakdown);

public sealed record FeeBreakdownItemDto(string Description, MoneyDto Amount);
