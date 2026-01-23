using FopSystem.Application.DTOs;
using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Subscriptions.Queries;

public record GetSubscriptionPlansQuery(bool IncludeInactive = false) : IRequest<IReadOnlyList<SubscriptionPlanDto>>;

public class GetSubscriptionPlansQueryHandler : IRequestHandler<GetSubscriptionPlansQuery, IReadOnlyList<SubscriptionPlanDto>>
{
    private readonly ISubscriptionPlanRepository _repository;

    public GetSubscriptionPlansQueryHandler(ISubscriptionPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<SubscriptionPlanDto>> Handle(GetSubscriptionPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = request.IncludeInactive
            ? await _repository.GetAllAsync(cancellationToken)
            : await _repository.GetAllActiveAsync(cancellationToken);

        return plans.Select(p => new SubscriptionPlanDto(
            p.Id,
            p.Tier.ToString(),
            p.Name,
            p.Description,
            p.MonthlyPrice.Amount,
            p.AnnualPrice.Amount,
            p.MonthlyPrice.Currency.ToString(),
            p.MaxUsers,
            p.MaxApplicationsPerMonth,
            p.IncludesCustomBranding,
            p.IncludesApiAccess,
            p.IncludesPrioritySupport,
            p.IncludesDedicatedManager,
            p.IncludesAdvancedAnalytics,
            p.IncludesSlaGuarantee,
            p.IsActive,
            p.DisplayOrder
        )).ToList();
    }
}
