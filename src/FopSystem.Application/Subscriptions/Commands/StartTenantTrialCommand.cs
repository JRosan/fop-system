using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Subscriptions.Commands;

public record StartTenantTrialCommand(
    Guid TenantId,
    int TrialDays = 30
) : IRequest<TenantSubscriptionDto>;

public class StartTenantTrialCommandHandler : IRequestHandler<StartTenantTrialCommand, TenantSubscriptionDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public StartTenantTrialCommandHandler(
        ITenantRepository tenantRepository,
        ISubscriptionPlanRepository planRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantSubscriptionDto> Handle(StartTenantTrialCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken)
            ?? throw new InvalidOperationException($"Tenant {request.TenantId} not found.");

        if (tenant.SubscriptionTier != SubscriptionTier.Trial && tenant.TrialEndDate.HasValue)
            throw new InvalidOperationException("This tenant has already used their trial period.");

        var trialEndDate = DateTime.UtcNow.AddDays(request.TrialDays);
        tenant.StartTrial(trialEndDate);

        _tenantRepository.Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var plan = await _planRepository.GetByTierAsync(SubscriptionTier.Trial, cancellationToken);

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
