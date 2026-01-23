using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Tenants.Queries;

public record GetTenantsQuery(bool ActiveOnly = false) : IQuery<IReadOnlyList<TenantSummaryDto>>;

public class GetTenantsQueryHandler : IQueryHandler<GetTenantsQuery, IReadOnlyList<TenantSummaryDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<Result<IReadOnlyList<TenantSummaryDto>>> Handle(GetTenantsQuery request, CancellationToken cancellationToken)
    {
        var tenants = request.ActiveOnly
            ? await _tenantRepository.GetActiveAsync(cancellationToken)
            : await _tenantRepository.GetAllAsync(cancellationToken);

        var dtos = tenants.Select(t => new TenantSummaryDto(
            t.Id,
            t.Code,
            t.Name,
            t.Subdomain,
            t.IsActive)).ToList();

        return Result.Success<IReadOnlyList<TenantSummaryDto>>(dtos);
    }
}
