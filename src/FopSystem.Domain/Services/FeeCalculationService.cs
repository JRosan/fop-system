using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services;

public interface IFeeCalculationService
{
    FeeCalculationResult Calculate(ApplicationType type, int seatCount, decimal mtowKg);
}

public class FeeCalculationService : IFeeCalculationService
{
    // Fee configuration (in production, these would come from a configuration store)
    private const decimal BaseFeeUsd = 150.00m;
    private const decimal PerSeatFeeUsd = 10.00m;
    private const decimal PerKgFeeUsd = 0.02m;

    private static readonly Dictionary<ApplicationType, decimal> TypeMultipliers = new()
    {
        { ApplicationType.OneTime, 1.0m },
        { ApplicationType.Blanket, 2.5m },
        { ApplicationType.Emergency, 0.5m }
    };

    public FeeCalculationResult Calculate(ApplicationType type, int seatCount, decimal mtowKg)
    {
        if (seatCount < 0)
            throw new ArgumentException("Seat count cannot be negative", nameof(seatCount));
        if (mtowKg < 0)
            throw new ArgumentException("MTOW cannot be negative", nameof(mtowKg));

        var baseFee = Money.Usd(BaseFeeUsd);
        var seatFee = Money.Usd(seatCount * PerSeatFeeUsd);
        var weightFee = Money.Usd(mtowKg * PerKgFeeUsd);

        var subtotal = baseFee + seatFee + weightFee;
        var multiplier = TypeMultipliers.GetValueOrDefault(type, 1.0m);
        var totalFee = subtotal * multiplier;

        var breakdown = new List<FeeBreakdownItem>
        {
            new("Base Fee", baseFee),
            new($"Seat Fee ({seatCount} seats × ${PerSeatFeeUsd:F2})", seatFee),
            new($"Weight Fee ({mtowKg:F0} kg × ${PerKgFeeUsd:F4})", weightFee),
        };

        if (multiplier != 1.0m)
        {
            // Calculate the adjustment amount (always positive for display)
            var adjustment = multiplier > 1.0m
                ? totalFee - subtotal  // Surcharge: total is higher
                : subtotal - totalFee; // Discount: subtotal is higher

            var multiplierDescription = type switch
            {
                ApplicationType.Blanket => "Blanket Permit Surcharge (2.5×)",
                ApplicationType.Emergency => "Emergency Discount (0.5×)",
                _ => multiplier > 1.0m ? $"Surcharge ({multiplier}×)" : $"Discount ({multiplier}×)"
            };
            breakdown.Add(new(multiplierDescription, adjustment));
        }

        return new FeeCalculationResult(
            BaseFee: baseFee,
            SeatFee: seatFee,
            WeightFee: weightFee,
            Multiplier: multiplier,
            TotalFee: totalFee,
            Breakdown: breakdown);
    }
}

public sealed record FeeCalculationResult(
    Money BaseFee,
    Money SeatFee,
    Money WeightFee,
    decimal Multiplier,
    Money TotalFee,
    IReadOnlyList<FeeBreakdownItem> Breakdown);

public sealed record FeeBreakdownItem(string Description, Money Amount);
