namespace FopSystem.Domain.ValueObjects;

public enum WeightUnit
{
    KG,
    LBS
}

public sealed class Weight : ValueObject
{
    private const decimal KgToLbsFactor = 2.20462m;

    public decimal Value { get; }
    public WeightUnit Unit { get; }

    private Weight(decimal value, WeightUnit unit)
    {
        Value = value;
        Unit = unit;
    }

    public static Weight Create(decimal value, WeightUnit unit)
    {
        if (value < 0)
        {
            throw new ArgumentException("Weight cannot be negative", nameof(value));
        }

        return new Weight(Math.Round(value, 2), unit);
    }

    public static Weight Kilograms(decimal value) => Create(value, WeightUnit.KG);

    public static Weight Pounds(decimal value) => Create(value, WeightUnit.LBS);

    public Weight ToKilograms()
    {
        if (Unit == WeightUnit.KG)
        {
            return this;
        }

        return Create(Value / KgToLbsFactor, WeightUnit.KG);
    }

    public Weight ToPounds()
    {
        if (Unit == WeightUnit.LBS)
        {
            return this;
        }

        return Create(Value * KgToLbsFactor, WeightUnit.LBS);
    }

    public decimal InKilograms => ToKilograms().Value;

    public decimal InPounds => ToPounds().Value;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return InKilograms;
    }

    public override string ToString() => $"{Value:F2} {Unit}";
}
