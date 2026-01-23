using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Subscriptions.Commands;

public record UpdateTenantSubscriptionCommand(
    Guid TenantId,
    string Tier,
    bool IsAnnualBilling
) : IRequest<TenantSubscriptionDto>;

public class UpdateTenantSubscriptionCommandHandler : IRequestHandler<UpdateTenantSubscriptionCommand, TenantSubscriptionDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantSubscriptionCommandHandler(
        ITenantRepository tenantRepository,
        ISubscriptionPlanRepository planRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantSubscriptionDto> Handle(UpdateTenantSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken)
            ?? throw new InvalidOperationException($"Tenant {request.TenantId} not found.");

        if (!Enum.TryParse<SubscriptionTier>(request.Tier, true, out var tier))
            throw new ArgumentException($"Invalid subscription tier: {request.Tier}");

        var plan = await _planRepository.GetByTierAsync(tier, cancellationToken)
            ?? throw new InvalidOperationException($"Subscription plan for tier {tier} not found.");

        var startDate = DateTime.UtcNow;
        var endDate = request.IsAnnualBilling
            ? startDate.AddYears(1)
            : startDate.AddMonths(1);

        tenant.UpdateSubscription(tier, request.IsAnnualBilling, startDate, endDate);

        _tenantRepository.Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var planDto = new SubscriptionPlanDto(
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
