using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Tenants.Queries;

public record GetTenantQuery(Guid Id) : IQuery<TenantDto>;

public class GetTenantQueryHandler : IQueryHandler<GetTenantQuery, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<Result<TenantDto>> Handle(GetTenantQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);

        if (tenant is null)
        {
            return Result.Failure<TenantDto>(Error.Custom("Tenant.NotFound", $"Tenant with ID {request.Id} was not found."));
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
