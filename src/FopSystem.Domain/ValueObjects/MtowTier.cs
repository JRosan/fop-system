namespace FopSystem.Domain.ValueObjects;

public enum MtowTierLevel
{
    Tier1,  // 0-12,500 lbs
    Tier2,  // 12,501-75,000 lbs
    Tier3,  // 75,001-100,000 lbs
    Tier4   // Over 100,000 lbs
}

public sealed class MtowTier : ValueObject
{
    private const decimal Tier1MaxLbs = 12500m;
    private const decimal Tier2MaxLbs = 75000m;
    private const decimal Tier3MaxLbs = 100000m;
    private const decimal KgToLbsFactor = 2.20462m;

    public MtowTierLevel Level { get; }
    public decimal WeightLbs { get; }

    private MtowTier(MtowTierLevel level, decimal weightLbs)
    {
        Level = level;
        WeightLbs = weightLbs;
    }

    public static MtowTier FromPounds(decimal weightLbs)
    {
        if (weightLbs < 0)
        {
            throw new ArgumentException("Weight cannot be negative", nameof(weightLbs));
        }

        var tier = DetermineTier(weightLbs);
        return new MtowTier(tier, Math.Round(weightLbs, 2));
    }

    public static MtowTier FromKilograms(decimal weightKg)
    {
        if (weightKg < 0)
        {
            throw new ArgumentException("Weight cannot be negative", nameof(weightKg));
        }

        var weightLbs = weightKg * KgToLbsFactor;
        return FromPounds(weightLbs);
    }

    public static MtowTier FromWeight(Weight weight)
    {
        return FromPounds(weight.InPounds);
    }

    private static MtowTierLevel DetermineTier(decimal weightLbs)
    {
        return weightLbs switch
        {
            <= Tier1MaxLbs => MtowTierLevel.Tier1,
            <= Tier2MaxLbs => MtowTierLevel.Tier2,
            <= Tier3MaxLbs => MtowTierLevel.Tier3,
            _ => MtowTierLevel.Tier4
        };
    }

    public decimal WeightInKilograms => WeightLbs / KgToLbsFactor;

    public bool IsTier1 => Level == MtowTierLevel.Tier1;
    public bool IsTier2 => Level == MtowTierLevel.Tier2;
    public bool IsTier3 => Level == MtowTierLevel.Tier3;
    public bool IsTier4 => Level == MtowTierLevel.Tier4;

    public static decimal Tier1MaxPounds => Tier1MaxLbs;
    public static decimal Tier2MaxPounds => Tier2MaxLbs;
    public static decimal Tier3MaxPounds => Tier3MaxLbs;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Level;
        yield return WeightLbs;
    }

    public override string ToString() => $"{Level} ({WeightLbs:N0} lbs)";
}
