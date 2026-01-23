using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using Currency = FopSystem.Domain.ValueObjects.Currency;

namespace FopSystem.Infrastructure.Persistence.Seeders;

/// <summary>
/// Seeds the default subscription plans for the SaaS platform.
/// </summary>
public class SubscriptionPlanSeeder
{
    private readonly FopDbContext _context;
    private readonly ILogger<SubscriptionPlanSeeder> _logger;

    public SubscriptionPlanSeeder(FopDbContext context, ILogger<SubscriptionPlanSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the default subscription plans if they don't exist.
    /// </summary>
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var existingPlans = await _context.SubscriptionPlans
            .Select(p => p.Tier)
            .ToListAsync(cancellationToken);

        if (existingPlans.Count >= 4)
        {
            _logger.LogInformation("Subscription plans already seeded, skipping");
            return;
        }

        _logger.LogInformation("Seeding subscription plans");

        var plans = new List<SubscriptionPlan>();

        if (!existingPlans.Contains(SubscriptionTier.Trial))
        {
            plans.Add(SubscriptionPlan.Create(
                tier: SubscriptionTier.Trial,
                name: "Trial",
                description: "30-day free trial with full Professional features",
                monthlyPrice: Money.Zero(Currency.USD),
                annualPrice: Money.Zero(Currency.USD),
                maxUsers: 25,
                maxApplicationsPerMonth: 500,
                includesCustomBranding: true,
                includesApiAccess: true,
                includesPrioritySupport: true,
                includesDedicatedManager: false,
                includesAdvancedAnalytics: true,
                includesSlaGuarantee: false,
                displayOrder: 0
            ));
        }

        if (!existingPlans.Contains(SubscriptionTier.Starter))
        {
            plans.Add(SubscriptionPlan.Create(
                tier: SubscriptionTier.Starter,
                name: "Starter",
                description: "For small territories getting started with digital permit management",
                monthlyPrice: Money.Create(499m, Currency.USD),
                annualPrice: Money.Create(4990m, Currency.USD),
                maxUsers: 5,
                maxApplicationsPerMonth: 50,
                includesCustomBranding: false,
                includesApiAccess: false,
                includesPrioritySupport: false,
                includesDedicatedManager: false,
                includesAdvancedAnalytics: false,
                includesSlaGuarantee: false,
                displayOrder: 1
            ));
        }

        if (!existingPlans.Contains(SubscriptionTier.Professional))
        {
            plans.Add(SubscriptionPlan.Create(
                tier: SubscriptionTier.Professional,
                name: "Professional",
                description: "For growing territories with advanced compliance needs",
                monthlyPrice: Money.Create(1499m, Currency.USD),
                annualPrice: Money.Create(14990m, Currency.USD),
                maxUsers: 25,
                maxApplicationsPerMonth: 500,
                includesCustomBranding: true,
                includesApiAccess: true,
                includesPrioritySupport: true,
                includesDedicatedManager: false,
                includesAdvancedAnalytics: true,
                includesSlaGuarantee: false,
                displayOrder: 2
            ));
        }

        if (!existingPlans.Contains(SubscriptionTier.Enterprise))
        {
            plans.Add(SubscriptionPlan.Create(
                tier: SubscriptionTier.Enterprise,
                name: "Enterprise",
                description: "For large territories requiring full platform capabilities",
                monthlyPrice: Money.Create(4999m, Currency.USD),
                annualPrice: Money.Create(49990m, Currency.USD),
                maxUsers: null, // Unlimited
                maxApplicationsPerMonth: null, // Unlimited
                includesCustomBranding: true,
                includesApiAccess: true,
                includesPrioritySupport: true,
                includesDedicatedManager: true,
                includesAdvancedAnalytics: true,
                includesSlaGuarantee: true,
                displayOrder: 3
            ));
        }

        if (plans.Count > 0)
        {
            await _context.SubscriptionPlans.AddRangeAsync(plans, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Seeded {Count} subscription plans", plans.Count);
        }
    }
}
