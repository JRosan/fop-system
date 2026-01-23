using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Tenants.Queries;

/// <summary>
/// Query to get a tenant by its unique code (e.g., "BVI", "CAYMAN").
/// Used when resolving tenant from X-Tenant-Code header.
/// </summary>
public record GetTenantByCodeQuery(string Code) : IQuery<TenantDto>;

public class GetTenantByCodeQueryHandler : IQueryHandler<GetTenantByCodeQuery, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantByCodeQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<Result<TenantDto>> Handle(GetTenantByCodeQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return Result.Failure<TenantDto>(
                Error.Custom("Tenant.InvalidCode", "Tenant code cannot be empty."));
        }

        var tenant = await _tenantRepository.GetByCodeAsync(
            request.Code.ToUpperInvariant(),
            cancellationToken);

        if (tenant is null)
        {
            return Result.Failure<TenantDto>(
                Error.Custom("Tenant.NotFound", $"Tenant with code '{request.Code}' was not found."));
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
