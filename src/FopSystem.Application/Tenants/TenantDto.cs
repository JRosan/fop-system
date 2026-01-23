namespace FopSystem.Application.Tenants;

public record TenantDto(
    Guid Id,
    string Code,
    string Name,
    string Subdomain,
    string? LogoUrl,
    string PrimaryColor,
    string SecondaryColor,
    string ContactEmail,
    string? ContactPhone,
    string TimeZone,
    string Currency,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record TenantSummaryDto(
    Guid Id,
    string Code,
    string Name,
    string Subdomain,
    bool IsActive);

/// <summary>
/// Minimal tenant info for branding purposes (public/anonymous endpoint).
/// </summary>
public record TenantBrandingDto(
    Guid Id,
    string Code,
    string Name,
    string? LogoUrl,
    string PrimaryColor,
    string SecondaryColor,
    string Currency);
