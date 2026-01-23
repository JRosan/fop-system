using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Tenants.Queries;

/// <summary>
/// Query to resolve a tenant by subdomain.
/// This is a public endpoint used for initial tenant resolution.
/// </summary>
public record GetTenantBySubdomainQuery(string Subdomain) : IQuery<TenantBrandingDto>;

public class GetTenantBySubdomainQueryHandler : IQueryHandler<GetTenantBySubdomainQuery, TenantBrandingDto>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantBySubdomainQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<Result<TenantBrandingDto>> Handle(
        GetTenantBySubdomainQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Subdomain))
        {
            return Result.Failure<TenantBrandingDto>(
                Error.Custom("Tenant.InvalidSubdomain", "Subdomain cannot be empty."));
        }

        var tenant = await _tenantRepository.GetBySubdomainAsync(
            request.Subdomain.ToLowerInvariant(),
            cancellationToken);

        if (tenant is null)
        {
            return Result.Failure<TenantBrandingDto>(
                Error.Custom("Tenant.NotFound", $"No tenant found for subdomain '{request.Subdomain}'."));
        }

        if (!tenant.IsActive)
        {
            return Result.Failure<TenantBrandingDto>(
                Error.Custom("Tenant.Inactive", $"Tenant '{tenant.Code}' is not active."));
        }

        return Result<TenantBrandingDto>.Success(new TenantBrandingDto(
            tenant.Id,
            tenant.Code,
            tenant.Name,
            tenant.LogoUrl,
            tenant.PrimaryColor,
            tenant.SecondaryColor,
            tenant.Currency));
    }
}
