using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Entities;

/// <summary>
/// Represents a tenant (territory/aviation authority) in the multi-tenant SaaS platform.
/// Each tenant has its own branding, fee structures, and isolated data.
/// </summary>
public class Tenant : AggregateRoot<Guid>
{
    /// <summary>
    /// Short code for the tenant (e.g., "BVI", "AXA", "CAY").
    /// Used for URL paths and display purposes.
    /// </summary>
    public string Code { get; private set; } = null!;

    /// <summary>
    /// Full name of the tenant/territory (e.g., "British Virgin Islands").
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Subdomain for the tenant (e.g., "bvi" for bvi.fopsystem.com).
    /// </summary>
    public string Subdomain { get; private set; } = null!;

    /// <summary>
    /// URL to the tenant's logo image.
    /// </summary>
    public string? LogoUrl { get; private set; }

    /// <summary>
    /// Primary brand color in hex format (e.g., "#1E3A5F").
    /// </summary>
    public string PrimaryColor { get; private set; } = "#1E3A5F";

    /// <summary>
    /// Secondary brand color in hex format (e.g., "#F4A460").
    /// </summary>
    public string SecondaryColor { get; private set; } = "#F4A460";

    /// <summary>
    /// Contact email for the aviation authority.
    /// </summary>
    public string ContactEmail { get; private set; } = null!;

    /// <summary>
    /// Contact phone number for the aviation authority.
    /// </summary>
    public string? ContactPhone { get; private set; }

    /// <summary>
    /// IANA timezone identifier (e.g., "America/Tortola").
    /// </summary>
    public string TimeZone { get; private set; } = "America/Tortola";

    /// <summary>
    /// Currency code for the tenant (e.g., "USD", "XCD").
    /// </summary>
    public string Currency { get; private set; } = "USD";

    /// <summary>
    /// Whether this tenant is currently active and can be used.
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// The tenant's current subscription tier.
    /// </summary>
    public SubscriptionTier SubscriptionTier { get; private set; } = SubscriptionTier.Trial;

    /// <summary>
    /// Whether the tenant is on annual billing (true) or monthly billing (false).
    /// </summary>
    public bool IsAnnualBilling { get; private set; } = false;

    /// <summary>
    /// The date when the current subscription period started.
    /// </summary>
    public DateTime? SubscriptionStartDate { get; private set; }

    /// <summary>
    /// The date when the current subscription period ends.
    /// </summary>
    public DateTime? SubscriptionEndDate { get; private set; }

    /// <summary>
    /// The date when the trial period ends (if on trial).
    /// </summary>
    public DateTime? TrialEndDate { get; private set; }

    private Tenant() { } // EF Core constructor

    private Tenant(
        Guid id,
        string code,
        string name,
        string subdomain,
        string contactEmail,
        string? logoUrl = null,
        string? primaryColor = null,
        string? secondaryColor = null,
        string? contactPhone = null,
        string? timeZone = null,
        string? currency = null)
    {
        Id = id;
        Code = code;
        Name = name;
        Subdomain = subdomain;
        ContactEmail = contactEmail;
        LogoUrl = logoUrl;

        if (!string.IsNullOrWhiteSpace(primaryColor))
            PrimaryColor = primaryColor;
        if (!string.IsNullOrWhiteSpace(secondaryColor))
            SecondaryColor = secondaryColor;
        if (!string.IsNullOrWhiteSpace(contactPhone))
            ContactPhone = contactPhone;
        if (!string.IsNullOrWhiteSpace(timeZone))
            TimeZone = timeZone;
        if (!string.IsNullOrWhiteSpace(currency))
            Currency = currency;
    }

    /// <summary>
    /// Creates a new tenant with the specified configuration.
    /// </summary>
    public static Tenant Create(
        string code,
        string name,
        string subdomain,
        string contactEmail,
        string? logoUrl = null,
        string? primaryColor = null,
        string? secondaryColor = null,
        string? contactPhone = null,
        string? timeZone = null,
        string? currency = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code, nameof(code));
        ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));
        ArgumentException.ThrowIfNullOrWhiteSpace(subdomain, nameof(subdomain));
        ArgumentException.ThrowIfNullOrWhiteSpace(contactEmail, nameof(contactEmail));

        if (code.Length > 10)
            throw new ArgumentException("Tenant code must be 10 characters or less.", nameof(code));

        return new Tenant(
            Guid.NewGuid(),
            code.ToUpperInvariant(),
            name,
            subdomain.ToLowerInvariant(),
            contactEmail,
            logoUrl,
            primaryColor,
            secondaryColor,
            contactPhone,
            timeZone,
            currency);
    }

    /// <summary>
    /// Updates the tenant's branding settings.
    /// </summary>
    public void UpdateBranding(string? logoUrl, string? primaryColor, string? secondaryColor)
    {
        LogoUrl = logoUrl;
        if (!string.IsNullOrWhiteSpace(primaryColor))
            PrimaryColor = primaryColor;
        if (!string.IsNullOrWhiteSpace(secondaryColor))
            SecondaryColor = secondaryColor;
        SetUpdatedAt();
    }

    /// <summary>
    /// Updates the tenant's contact information.
    /// </summary>
    public void UpdateContactInfo(string contactEmail, string? contactPhone)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contactEmail, nameof(contactEmail));
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        SetUpdatedAt();
    }

    /// <summary>
    /// Updates the tenant's basic information.
    /// </summary>
    public void UpdateInfo(string name, string subdomain, string timeZone, string currency)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));
        ArgumentException.ThrowIfNullOrWhiteSpace(subdomain, nameof(subdomain));
        ArgumentException.ThrowIfNullOrWhiteSpace(timeZone, nameof(timeZone));
        ArgumentException.ThrowIfNullOrWhiteSpace(currency, nameof(currency));

        Name = name;
        Subdomain = subdomain.ToLowerInvariant();
        TimeZone = timeZone;
        Currency = currency;
        SetUpdatedAt();
    }

    /// <summary>
    /// Activates the tenant.
    /// </summary>
    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    /// <summary>
    /// Deactivates the tenant. Deactivated tenants cannot be accessed.
    /// </summary>
    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    /// <summary>
    /// Updates the tenant's subscription.
    /// </summary>
    public void UpdateSubscription(
        SubscriptionTier tier,
        bool isAnnualBilling,
        DateTime startDate,
        DateTime endDate)
    {
        SubscriptionTier = tier;
        IsAnnualBilling = isAnnualBilling;
        SubscriptionStartDate = startDate;
        SubscriptionEndDate = endDate;

        // Clear trial end date when upgrading from trial
        if (tier != SubscriptionTier.Trial)
            TrialEndDate = null;

        SetUpdatedAt();
    }

    /// <summary>
    /// Starts a trial period for the tenant.
    /// </summary>
    public void StartTrial(DateTime trialEndDate)
    {
        SubscriptionTier = SubscriptionTier.Trial;
        TrialEndDate = trialEndDate;
        SubscriptionStartDate = DateTime.UtcNow;
        SubscriptionEndDate = trialEndDate;
        SetUpdatedAt();
    }

    /// <summary>
    /// Checks if the tenant's subscription is currently active.
    /// </summary>
    public bool HasActiveSubscription()
    {
        if (!IsActive) return false;

        if (SubscriptionTier == SubscriptionTier.Trial)
            return TrialEndDate.HasValue && TrialEndDate.Value > DateTime.UtcNow;

        return SubscriptionEndDate.HasValue && SubscriptionEndDate.Value > DateTime.UtcNow;
    }
}
