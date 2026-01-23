using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services.Fees;

/// <summary>
/// Default FOP fee policy with hardcoded rates.
/// Used as a fallback when no tenant-specific configuration exists.
/// </summary>
public class DefaultFopFeePolicy : IFopFeePolicy
{
    // Default fee configuration (matches original hardcoded values)
    private const decimal BaseFeeUsd = 150.00m;
    private const decimal PerSeatFeeUsd = 10.00m;
    private const decimal PerKgFeeUsd = 0.02m;

    private static readonly Dictionary<ApplicationType, decimal> TypeMultipliers = new()
    {
        { ApplicationType.OneTime, 1.0m },
        { ApplicationType.Blanket, 2.5m },
        { ApplicationType.Emergency, 0.5m }
    };

    public Money GetBaseFee() => Money.Usd(BaseFeeUsd);

    public Money GetPerSeatFee() => Money.Usd(PerSeatFeeUsd);

    public Money GetPerKgFee() => Money.Usd(PerKgFeeUsd);

    public decimal GetMultiplier(ApplicationType type) =>
        TypeMultipliers.GetValueOrDefault(type, 1.0m);

    public string GetPolicySource() => "Default Policy";
}
