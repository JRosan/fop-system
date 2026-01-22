namespace FopSystem.Domain.ValueObjects;

public sealed class InsurancePolicy : ValueObject
{
    public string PolicyNumber { get; }
    public string Insurer { get; }
    public Money CoverageAmount { get; }
    public DateOnly EffectiveDate { get; }
    public DateOnly ExpiryDate { get; }

    private InsurancePolicy(
        string policyNumber,
        string insurer,
        Money coverageAmount,
        DateOnly effectiveDate,
        DateOnly expiryDate)
    {
        PolicyNumber = policyNumber;
        Insurer = insurer;
        CoverageAmount = coverageAmount;
        EffectiveDate = effectiveDate;
        ExpiryDate = expiryDate;
    }

    public static InsurancePolicy Create(
        string policyNumber,
        string insurer,
        Money coverageAmount,
        DateOnly effectiveDate,
        DateOnly expiryDate)
    {
        if (string.IsNullOrWhiteSpace(policyNumber))
        {
            throw new ArgumentException("Policy number is required", nameof(policyNumber));
        }

        if (string.IsNullOrWhiteSpace(insurer))
        {
            throw new ArgumentException("Insurer is required", nameof(insurer));
        }

        if (expiryDate <= effectiveDate)
        {
            throw new ArgumentException("Expiry date must be after effective date", nameof(expiryDate));
        }

        return new InsurancePolicy(policyNumber, insurer, coverageAmount, effectiveDate, expiryDate);
    }

    public bool IsExpired(DateOnly asOfDate) => asOfDate > ExpiryDate;

    public bool IsExpiringSoon(DateOnly asOfDate, int daysThreshold = 30)
    {
        var warningDate = ExpiryDate.AddDays(-daysThreshold);
        return asOfDate >= warningDate && asOfDate <= ExpiryDate;
    }

    public int DaysUntilExpiry(DateOnly asOfDate)
    {
        return ExpiryDate.DayNumber - asOfDate.DayNumber;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return PolicyNumber;
        yield return Insurer;
        yield return CoverageAmount;
        yield return EffectiveDate;
        yield return ExpiryDate;
    }

    public override string ToString() => $"Policy {PolicyNumber} ({Insurer}), expires {ExpiryDate:yyyy-MM-dd}";
}
