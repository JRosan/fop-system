using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Entities;

/// <summary>
/// Represents a subscription plan for the FOP System SaaS platform.
/// Aviation authorities subscribe to these plans to access the system.
/// </summary>
public class SubscriptionPlan : AggregateRoot<Guid>
{
    /// <summary>
    /// The subscription tier this plan represents.
    /// </summary>
    public SubscriptionTier Tier { get; private set; }

    /// <summary>
    /// Display name for the plan.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Short description of the plan.
    /// </summary>
    public string Description { get; private set; } = null!;

    /// <summary>
    /// Monthly price for the plan.
    /// </summary>
    public Money MonthlyPrice { get; private set; } = null!;

    /// <summary>
    /// Annual price for the plan (typically discounted).
    /// </summary>
    public Money AnnualPrice { get; private set; } = null!;

    /// <summary>
    /// Maximum number of users allowed on this plan.
    /// Null means unlimited.
    /// </summary>
    public int? MaxUsers { get; private set; }

    /// <summary>
    /// Maximum number of applications per month.
    /// Null means unlimited.
    /// </summary>
    public int? MaxApplicationsPerMonth { get; private set; }

    /// <summary>
    /// Whether custom branding is included.
    /// </summary>
    public bool IncludesCustomBranding { get; private set; }

    /// <summary>
    /// Whether API access is included.
    /// </summary>
    public bool IncludesApiAccess { get; private set; }

    /// <summary>
    /// Whether priority support is included.
    /// </summary>
    public bool IncludesPrioritySupport { get; private set; }

    /// <summary>
    /// Whether dedicated account manager is included.
    /// </summary>
    public bool IncludesDedicatedManager { get; private set; }

    /// <summary>
    /// Whether advanced analytics/reporting is included.
    /// </summary>
    public bool IncludesAdvancedAnalytics { get; private set; }

    /// <summary>
    /// Whether SLA guarantees are included.
    /// </summary>
    public bool IncludesSlaGuarantee { get; private set; }

    /// <summary>
    /// Whether this plan is currently active and available for purchase.
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Display order for the plan in pricing pages.
    /// </summary>
    public int DisplayOrder { get; private set; }

    private SubscriptionPlan() { } // EF Core constructor

    public static SubscriptionPlan Create(
        SubscriptionTier tier,
        string name,
        string description,
        Money monthlyPrice,
        Money annualPrice,
        int? maxUsers,
        int? maxApplicationsPerMonth,
        bool includesCustomBranding,
        bool includesApiAccess,
        bool includesPrioritySupport,
        bool includesDedicatedManager,
        bool includesAdvancedAnalytics,
        bool includesSlaGuarantee,
        int displayOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));
        ArgumentException.ThrowIfNullOrWhiteSpace(description, nameof(description));
        ArgumentNullException.ThrowIfNull(monthlyPrice, nameof(monthlyPrice));
        ArgumentNullException.ThrowIfNull(annualPrice, nameof(annualPrice));

        return new SubscriptionPlan
        {
            Id = Guid.NewGuid(),
            Tier = tier,
            Name = name,
            Description = description,
            MonthlyPrice = monthlyPrice,
            AnnualPrice = annualPrice,
            MaxUsers = maxUsers,
            MaxApplicationsPerMonth = maxApplicationsPerMonth,
            IncludesCustomBranding = includesCustomBranding,
            IncludesApiAccess = includesApiAccess,
            IncludesPrioritySupport = includesPrioritySupport,
            IncludesDedicatedManager = includesDedicatedManager,
            IncludesAdvancedAnalytics = includesAdvancedAnalytics,
            IncludesSlaGuarantee = includesSlaGuarantee,
            DisplayOrder = displayOrder
        };
    }

    public void Update(
        string name,
        string description,
        Money monthlyPrice,
        Money annualPrice,
        int? maxUsers,
        int? maxApplicationsPerMonth,
        bool includesCustomBranding,
        bool includesApiAccess,
        bool includesPrioritySupport,
        bool includesDedicatedManager,
        bool includesAdvancedAnalytics,
        bool includesSlaGuarantee,
        int displayOrder)
    {
        Name = name;
        Description = description;
        MonthlyPrice = monthlyPrice;
        AnnualPrice = annualPrice;
        MaxUsers = maxUsers;
        MaxApplicationsPerMonth = maxApplicationsPerMonth;
        IncludesCustomBranding = includesCustomBranding;
        IncludesApiAccess = includesApiAccess;
        IncludesPrioritySupport = includesPrioritySupport;
        IncludesDedicatedManager = includesDedicatedManager;
        IncludesAdvancedAnalytics = includesAdvancedAnalytics;
        IncludesSlaGuarantee = includesSlaGuarantee;
        DisplayOrder = displayOrder;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }
}
