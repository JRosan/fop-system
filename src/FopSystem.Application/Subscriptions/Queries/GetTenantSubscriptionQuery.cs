using FopSystem.Application.DTOs;
using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Subscriptions.Queries;

public record GetTenantSubscriptionQuery(Guid TenantId) : IRequest<TenantSubscriptionDto?>;

public class GetTenantSubscriptionQueryHandler : IRequestHandler<GetTenantSubscriptionQuery, TenantSubscriptionDto?>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionPlanRepository _planRepository;

    public GetTenantSubscriptionQueryHandler(
        ITenantRepository tenantRepository,
        ISubscriptionPlanRepository planRepository)
    {
        _tenantRepository = tenantRepository;
        _planRepository = planRepository;
    }

    public async Task<TenantSubscriptionDto?> Handle(GetTenantSubscriptionQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
            return null;

        var plan = await _planRepository.GetByTierAsync(tenant.SubscriptionTier, cancellationToken);

        SubscriptionPlanDto? planDto = null;
        if (plan != null)
        {
            planDto = new SubscriptionPlanDto(
                plan.Id,
                plan.Tier.ToString(),
                plan.Name,
                plan.Description,
                plan.MonthlyPrice.Amount,
                plan.AnnualPrice.Amount,
                plan.MonthlyPrice.Currency.ToString(),
                plan.MaxUsers,
                plan.MaxApplicationsPerMonth,
                plan.IncludesCustomBranding,
                plan.IncludesApiAccess,
                plan.IncludesPrioritySupport,
                plan.IncludesDedicatedManager,
                plan.IncludesAdvancedAnalytics,
                plan.IncludesSlaGuarantee,
                plan.IsActive,
                plan.DisplayOrder
            );
        }

        return new TenantSubscriptionDto(
            tenant.Id,
            tenant.Name,
            tenant.SubscriptionTier.ToString(),
            tenant.IsAnnualBilling,
            tenant.SubscriptionStartDate,
            tenant.SubscriptionEndDate,
            tenant.TrialEndDate,
            tenant.HasActiveSubscription(),
            planDto
        );
    }
}
