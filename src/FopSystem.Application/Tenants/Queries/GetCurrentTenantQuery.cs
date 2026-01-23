using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;

namespace FopSystem.Application.Tenants.Queries;

public record GetCurrentTenantQuery : IQuery<TenantDto>;

public class GetCurrentTenantQueryHandler : IQueryHandler<GetCurrentTenantQuery, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantContext _tenantContext;

    public GetCurrentTenantQueryHandler(
        ITenantRepository tenantRepository,
        ITenantContext tenantContext)
    {
        _tenantRepository = tenantRepository;
        _tenantContext = tenantContext;
    }

    public async Task<Result<TenantDto>> Handle(GetCurrentTenantQuery request, CancellationToken cancellationToken)
    {
        if (!_tenantContext.HasTenant)
        {
            return Result.Failure<TenantDto>(Error.Custom("Tenant.NotResolved", "No tenant has been resolved for the current context."));
        }

        var tenant = await _tenantRepository.GetByIdAsync(_tenantContext.TenantId, cancellationToken);

        if (tenant is null)
        {
            return Result.Failure<TenantDto>(Error.Custom("Tenant.NotFound", $"Tenant with ID {_tenantContext.TenantId} was not found."));
        }

        return Result<TenantDto>.Success(new TenantDto(
            tenant.Id,
            tenant.Code,
            tenant.Name,
            tenant.Subdomain,
            tenant.LogoUrl,
            tenant.PrimaryColor,
            tenant.SecondaryColor,
            tenant.ContactEmail,
            tenant.ContactPhone,
            tenant.TimeZone,
            tenant.Currency,
            tenant.IsActive,
            tenant.CreatedAt,
            tenant.UpdatedAt));
    }
}
