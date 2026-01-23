using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Tenants.Commands;

public record CreateTenantCommand(
    string Code,
    string Name,
    string Subdomain,
    string ContactEmail,
    string? LogoUrl = null,
    string? PrimaryColor = null,
    string? SecondaryColor = null,
    string? ContactPhone = null,
    string? TimeZone = null,
    string? Currency = null) : ICommand<TenantDto>;

public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Tenant code is required")
            .MaximumLength(10).WithMessage("Tenant code must be 10 characters or less")
            .Matches("^[A-Za-z0-9]+$").WithMessage("Tenant code must contain only alphanumeric characters");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tenant name is required")
            .MaximumLength(100).WithMessage("Tenant name must be 100 characters or less");

        RuleFor(x => x.Subdomain)
            .NotEmpty().WithMessage("Subdomain is required")
            .MaximumLength(50).WithMessage("Subdomain must be 50 characters or less")
            .Matches("^[a-z0-9-]+$").WithMessage("Subdomain must contain only lowercase letters, numbers, and hyphens");

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Contact email is required")
            .EmailAddress().WithMessage("Invalid email format");

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

public class CreateTenantCommandHandler : ICommandHandler<CreateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TenantDto>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicate code
        if (await _tenantRepository.ExistsByCodeAsync(request.Code, cancellationToken))
        {
            return Result.Failure<TenantDto>(Error.Custom("Tenant.DuplicateCode", $"A tenant with code '{request.Code}' already exists."));
        }

        // Check for duplicate subdomain
        if (await _tenantRepository.ExistsBySubdomainAsync(request.Subdomain, cancellationToken))
        {
            return Result.Failure<TenantDto>(Error.Custom("Tenant.DuplicateSubdomain", $"A tenant with subdomain '{request.Subdomain}' already exists."));
        }

        var tenant = Tenant.Create(
            request.Code,
            request.Name,
            request.Subdomain,
            request.ContactEmail,
            request.LogoUrl,
            request.PrimaryColor,
            request.SecondaryColor,
            request.ContactPhone,
            request.TimeZone,
            request.Currency);

        await _tenantRepository.AddAsync(tenant, cancellationToken);
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
