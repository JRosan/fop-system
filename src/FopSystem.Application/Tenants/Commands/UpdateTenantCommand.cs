using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Tenants.Commands;

public record UpdateTenantCommand(
    Guid Id,
    string? Name = null,
    string? Subdomain = null,
    string? LogoUrl = null,
    string? PrimaryColor = null,
    string? SecondaryColor = null,
    string? ContactEmail = null,
    string? ContactPhone = null,
    string? TimeZone = null,
    string? Currency = null) : ICommand<TenantDto>;

public class UpdateTenantCommandValidator : AbstractValidator<UpdateTenantCommand>
{
    public UpdateTenantCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Name)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Name))
            .WithMessage("Tenant name must be 100 characters or less");

        RuleFor(x => x.Subdomain)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Subdomain))
            .Matches("^[a-z0-9-]+$").When(x => !string.IsNullOrEmpty(x.Subdomain))
            .WithMessage("Subdomain must contain only lowercase letters, numbers, and hyphens");

        RuleFor(x => x.ContactEmail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.ContactEmail))
            .WithMessage("Invalid email format");

        RuleFor(x => x.PrimaryColor)
            .Matches("^#[0-9A-Fa-f]{6}$").When(x => !string.IsNullOrEmpty(x.PrimaryColor))
            .WithMessage("Primary color must be a valid hex color (e.g., #1E3A5F)");

        RuleFor(x => x.SecondaryColor)
            .Matches("^#[0-9A-Fa-f]{6}$").When(x => !string.IsNullOrEmpty(x.SecondaryColor))
            .WithMessage("Secondary color must be a valid hex color (e.g., #F4A460)");

        RuleFor(x => x.Currency)
            .MaximumLength(3).When(x => !string.IsNullOrEmpty(x.Currency))
            .WithMessage("Currency must be 3 characters or less");
    }
}

public class UpdateTenantCommandHandler : ICommandHandler<UpdateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TenantDto>> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);

        if (tenant is null)
        {
            return Result.Failure<TenantDto>(Error.Custom("Tenant.NotFound", $"Tenant with ID {request.Id} was not found."));
        }

        // Check for duplicate subdomain if changing
        if (!string.IsNullOrEmpty(request.Subdomain) &&
            request.Subdomain.ToLowerInvariant() != tenant.Subdomain)
        {
            if (await _tenantRepository.ExistsBySubdomainAsync(request.Subdomain, cancellationToken))
            {
                return Result.Failure<TenantDto>(Error.Custom("Tenant.DuplicateSubdomain", $"A tenant with subdomain '{request.Subdomain}' already exists."));
            }
        }

        // Update branding if provided
        if (request.LogoUrl != null || request.PrimaryColor != null || request.SecondaryColor != null)
        {
            tenant.UpdateBranding(
                request.LogoUrl ?? tenant.LogoUrl,
                request.PrimaryColor,
                request.SecondaryColor);
        }

        // Update contact info if provided
        if (request.ContactEmail != null || request.ContactPhone != null)
        {
            tenant.UpdateContactInfo(
                request.ContactEmail ?? tenant.ContactEmail,
                request.ContactPhone ?? tenant.ContactPhone);
        }

        // Update general info if provided
        if (request.Name != null || request.Subdomain != null || request.TimeZone != null || request.Currency != null)
        {
            tenant.UpdateInfo(
                request.Name ?? tenant.Name,
                request.Subdomain ?? tenant.Subdomain,
                request.TimeZone ?? tenant.TimeZone,
                request.Currency ?? tenant.Currency);
        }

        _tenantRepository.Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
