using FopSystem.Domain.Enums;
using FopSystem.Domain.Services.Fees;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services;

public interface IFeeCalculationService
{
    FeeCalculationResult Calculate(ApplicationType type, int seatCount, decimal mtowKg);
    FeeCalculationResult Calculate(ApplicationType type, int seatCount, decimal mtowKg, IFopFeePolicy policy);
}

public class FeeCalculationService : IFeeCalculationService
{
    private readonly IFopFeePolicy _defaultPolicy;

    public FeeCalculationService() : this(new DefaultFopFeePolicy())
    {
    }

    public FeeCalculationService(IFopFeePolicy defaultPolicy)
    {
        _defaultPolicy = defaultPolicy ?? throw new ArgumentNullException(nameof(defaultPolicy));
    }

    public FeeCalculationResult Calculate(ApplicationType type, int seatCount, decimal mtowKg)
    {
        return Calculate(type, seatCount, mtowKg, _defaultPolicy);
    }

    public FeeCalculationResult Calculate(ApplicationType type, int seatCount, decimal mtowKg, IFopFeePolicy policy)
    {
        if (seatCount < 0)
            throw new ArgumentException("Seat count cannot be negative", nameof(seatCount));
        if (mtowKg < 0)
            throw new ArgumentException("MTOW cannot be negative", nameof(mtowKg));

        var baseFee = policy.GetBaseFee();
        var perSeatFee = policy.GetPerSeatFee();
        var perKgFee = policy.GetPerKgFee();

        var seatFee = Money.Usd(seatCount * perSeatFee.Amount);
        var weightFee = Money.Usd(mtowKg * perKgFee.Amount);

        var subtotal = baseFee + seatFee + weightFee;
        var multiplier = policy.GetMultiplier(type);
        var totalFee = subtotal * multiplier;

        var breakdown = new List<FeeBreakdownItem>
        {
            new("Base Fee", baseFee),
            new($"Seat Fee ({seatCount} seats × ${perSeatFee.Amount:F2})", seatFee),
            new($"Weight Fee ({mtowKg:F0} kg × ${perKgFee.Amount:F4})", weightFee),
        };

        if (multiplier != 1.0m)
        {
            // Calculate the adjustment amount (always positive for display)
            var adjustment = multiplier > 1.0m
                ? totalFee - subtotal  // Surcharge: total is higher
                : subtotal - totalFee; // Discount: subtotal is higher

            var multiplierDescription = type switch
            {
                ApplicationType.Blanket => $"Blanket Permit Surcharge ({multiplier}×)",
                ApplicationType.Emergency => $"Emergency Discount ({multiplier}×)",
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
            Breakdown: breakdown,
            PolicySource: policy.GetPolicySource());
    }
}

public sealed record FeeCalculationResult(
    Money BaseFee,
    Money SeatFee,
    Money WeightFee,
    decimal Multiplier,
    Money TotalFee,
    IReadOnlyList<FeeBreakdownItem> Breakdown,
    string? PolicySource = null);

public sealed record FeeBreakdownItem(string Description, Money Amount);
