using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Revenue;

public class BviaFeeRate : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public BviaFeeCategory Category { get; private set; }
    public FlightOperationType OperationType { get; private set; }
    public BviAirport? Airport { get; private set; }
    public MtowTierLevel? MtowTier { get; private set; }

    public Money Rate { get; private set; } = default!;
    public bool IsPerUnit { get; private set; }
    public string? UnitDescription { get; private set; }
    public Money? MinimumFee { get; private set; }

    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }

    public string? Description { get; private set; }
    public bool IsActive { get; private set; }

    private BviaFeeRate() { }

    public static BviaFeeRate Create(
        BviaFeeCategory category,
        FlightOperationType operationType,
        Money rate,
        bool isPerUnit,
        string? unitDescription,
        DateOnly effectiveFrom,
        BviAirport? airport = null,
        MtowTierLevel? mtowTier = null,
        Money? minimumFee = null,
        string? description = null)
    {
        return new BviaFeeRate
        {
            Id = Guid.NewGuid(),
            Category = category,
            OperationType = operationType,
            Airport = airport,
            MtowTier = mtowTier,
            Rate = rate,
            IsPerUnit = isPerUnit,
            UnitDescription = unitDescription,
            MinimumFee = minimumFee,
            EffectiveFrom = effectiveFrom,
            EffectiveTo = null,
            Description = description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        Money rate,
        bool isPerUnit,
        string? unitDescription,
        Money? minimumFee,
        string? description)
    {
        Rate = rate;
        IsPerUnit = isPerUnit;
        UnitDescription = unitDescription;
        MinimumFee = minimumFee;
        Description = description;
        SetUpdatedAt();
    }

    public void Deactivate(DateOnly effectiveTo)
    {
        if (!IsActive)
            throw new InvalidOperationException("Fee rate is already inactive");

        if (effectiveTo < EffectiveFrom)
            throw new ArgumentException("Effective to date must be after effective from date");

        IsActive = false;
        EffectiveTo = effectiveTo;
        SetUpdatedAt();
    }

    public void Reactivate()
    {
        if (IsActive)
            throw new InvalidOperationException("Fee rate is already active");

        IsActive = true;
        EffectiveTo = null;
        SetUpdatedAt();
    }

    public bool IsEffectiveOn(DateOnly date)
    {
        return IsActive &&
               date >= EffectiveFrom &&
               (EffectiveTo is null || date <= EffectiveTo);
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
