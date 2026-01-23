using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Entities;

public class FeeConfiguration : Entity<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public decimal BaseFeeUsd { get; private set; }
    public decimal PerSeatFeeUsd { get; private set; }
    public decimal PerKgFeeUsd { get; private set; }
    public decimal OneTimeMultiplier { get; private set; }
    public decimal BlanketMultiplier { get; private set; }
    public decimal EmergencyMultiplier { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }
    public string? ModifiedBy { get; private set; }
    public string? Notes { get; private set; }

    private FeeConfiguration() { }

    public static FeeConfiguration Create(
        decimal baseFeeUsd,
        decimal perSeatFeeUsd,
        decimal perKgFeeUsd,
        decimal oneTimeMultiplier,
        decimal blanketMultiplier,
        decimal emergencyMultiplier,
        string modifiedBy,
        DateTime? effectiveFrom = null,
        DateTime? effectiveTo = null,
        string? notes = null)
    {
        ValidateFees(baseFeeUsd, perSeatFeeUsd, perKgFeeUsd);
        ValidateMultipliers(oneTimeMultiplier, blanketMultiplier, emergencyMultiplier);

        return new FeeConfiguration
        {
            Id = Guid.NewGuid(),
            BaseFeeUsd = baseFeeUsd,
            PerSeatFeeUsd = perSeatFeeUsd,
            PerKgFeeUsd = perKgFeeUsd,
            OneTimeMultiplier = oneTimeMultiplier,
            BlanketMultiplier = blanketMultiplier,
            EmergencyMultiplier = emergencyMultiplier,
            IsActive = true,
            EffectiveFrom = effectiveFrom,
            EffectiveTo = effectiveTo,
            ModifiedBy = modifiedBy,
            Notes = notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static FeeConfiguration CreateDefault(string modifiedBy)
    {
        return Create(
            baseFeeUsd: 150.00m,
            perSeatFeeUsd: 10.00m,
            perKgFeeUsd: 0.02m,
            oneTimeMultiplier: 1.0m,
            blanketMultiplier: 2.5m,
            emergencyMultiplier: 0.5m,
            modifiedBy: modifiedBy,
            notes: "Default fee configuration");
    }

    public void Update(
        decimal? baseFeeUsd = null,
        decimal? perSeatFeeUsd = null,
        decimal? perKgFeeUsd = null,
        decimal? oneTimeMultiplier = null,
        decimal? blanketMultiplier = null,
        decimal? emergencyMultiplier = null,
        string? modifiedBy = null,
        DateTime? effectiveFrom = null,
        DateTime? effectiveTo = null,
        string? notes = null)
    {
        if (baseFeeUsd.HasValue || perSeatFeeUsd.HasValue || perKgFeeUsd.HasValue)
        {
            ValidateFees(
                baseFeeUsd ?? BaseFeeUsd,
                perSeatFeeUsd ?? PerSeatFeeUsd,
                perKgFeeUsd ?? PerKgFeeUsd);
        }

        if (oneTimeMultiplier.HasValue || blanketMultiplier.HasValue || emergencyMultiplier.HasValue)
        {
            ValidateMultipliers(
                oneTimeMultiplier ?? OneTimeMultiplier,
                blanketMultiplier ?? BlanketMultiplier,
                emergencyMultiplier ?? EmergencyMultiplier);
        }

        if (baseFeeUsd.HasValue) BaseFeeUsd = baseFeeUsd.Value;
        if (perSeatFeeUsd.HasValue) PerSeatFeeUsd = perSeatFeeUsd.Value;
        if (perKgFeeUsd.HasValue) PerKgFeeUsd = perKgFeeUsd.Value;
        if (oneTimeMultiplier.HasValue) OneTimeMultiplier = oneTimeMultiplier.Value;
        if (blanketMultiplier.HasValue) BlanketMultiplier = blanketMultiplier.Value;
        if (emergencyMultiplier.HasValue) EmergencyMultiplier = emergencyMultiplier.Value;
        if (effectiveFrom.HasValue) EffectiveFrom = effectiveFrom.Value;
        if (effectiveTo.HasValue) EffectiveTo = effectiveTo.Value;
        if (modifiedBy is not null) ModifiedBy = modifiedBy;
        if (notes is not null) Notes = notes;

        SetUpdatedAt();
    }

    public void Activate()
    {
        if (IsActive)
            throw new InvalidOperationException("Configuration is already active");

        IsActive = true;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        if (!IsActive)
            throw new InvalidOperationException("Configuration is already inactive");

        IsActive = false;
        SetUpdatedAt();
    }

    public decimal GetMultiplier(ApplicationType type) => type switch
    {
        ApplicationType.OneTime => OneTimeMultiplier,
        ApplicationType.Blanket => BlanketMultiplier,
        ApplicationType.Emergency => EmergencyMultiplier,
        _ => 1.0m
    };

    private static void ValidateFees(decimal baseFee, decimal perSeatFee, decimal perKgFee)
    {
        if (baseFee < 0)
            throw new ArgumentException("Base fee cannot be negative", nameof(baseFee));
        if (perSeatFee < 0)
            throw new ArgumentException("Per-seat fee cannot be negative", nameof(perSeatFee));
        if (perKgFee < 0)
            throw new ArgumentException("Per-kg fee cannot be negative", nameof(perKgFee));
    }

    private static void ValidateMultipliers(decimal oneTime, decimal blanket, decimal emergency)
    {
        if (oneTime <= 0)
            throw new ArgumentException("One-time multiplier must be positive", nameof(oneTime));
        if (blanket <= 0)
            throw new ArgumentException("Blanket multiplier must be positive", nameof(blanket));
        if (emergency <= 0)
            throw new ArgumentException("Emergency multiplier must be positive", nameof(emergency));
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
