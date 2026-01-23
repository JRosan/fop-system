using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public record SubscriptionPlanDto(
    Guid Id,
    string Tier,
    string Name,
    string Description,
    decimal MonthlyPrice,
    decimal AnnualPrice,
    string Currency,
    int? MaxUsers,
    int? MaxApplicationsPerMonth,
    bool IncludesCustomBranding,
    bool IncludesApiAccess,
    bool IncludesPrioritySupport,
    bool IncludesDedicatedManager,
    bool IncludesAdvancedAnalytics,
    bool IncludesSlaGuarantee,
    bool IsActive,
    int DisplayOrder
);

public record TenantSubscriptionDto(
    Guid TenantId,
    string TenantName,
    string SubscriptionTier,
    bool IsAnnualBilling,
    DateTime? SubscriptionStartDate,
    DateTime? SubscriptionEndDate,
    DateTime? TrialEndDate,
    bool IsActive,
    SubscriptionPlanDto? CurrentPlan
);

public record UpdateSubscriptionRequest(
    string Tier,
    bool IsAnnualBilling
);

public record StartTrialRequest(
    int TrialDays = 30
);
