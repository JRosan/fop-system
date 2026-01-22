using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.FeeConfiguration.Commands;

public sealed record CreateFeeConfigurationCommand(
    decimal BaseFeeUsd,
    decimal PerSeatFeeUsd,
    decimal PerKgFeeUsd,
    decimal OneTimeMultiplier,
    decimal BlanketMultiplier,
    decimal EmergencyMultiplier,
    string ModifiedBy,
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null,
    string? Notes = null) : ICommand<FeeConfigurationDto>;

public sealed record FeeConfigurationDto(
    Guid Id,
    decimal BaseFeeUsd,
    decimal PerSeatFeeUsd,
    decimal PerKgFeeUsd,
    decimal OneTimeMultiplier,
    decimal BlanketMultiplier,
    decimal EmergencyMultiplier,
    bool IsActive,
    DateTime? EffectiveFrom,
    DateTime? EffectiveTo,
    string? ModifiedBy,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed class CreateFeeConfigurationCommandValidator : AbstractValidator<CreateFeeConfigurationCommand>
{
    public CreateFeeConfigurationCommandValidator()
    {
        RuleFor(x => x.BaseFeeUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PerSeatFeeUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PerKgFeeUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.OneTimeMultiplier).GreaterThan(0);
        RuleFor(x => x.BlanketMultiplier).GreaterThan(0);
        RuleFor(x => x.EmergencyMultiplier).GreaterThan(0);
        RuleFor(x => x.ModifiedBy).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}

public sealed class CreateFeeConfigurationCommandHandler : ICommandHandler<CreateFeeConfigurationCommand, FeeConfigurationDto>
{
    private readonly IFeeConfigurationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFeeConfigurationCommandHandler(
        IFeeConfigurationRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<FeeConfigurationDto>> Handle(
        CreateFeeConfigurationCommand request,
        CancellationToken cancellationToken)
    {
        var config = Domain.Entities.FeeConfiguration.Create(
            request.BaseFeeUsd,
            request.PerSeatFeeUsd,
            request.PerKgFeeUsd,
            request.OneTimeMultiplier,
            request.BlanketMultiplier,
            request.EmergencyMultiplier,
            request.ModifiedBy,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.Notes);

        _repository.Add(config);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(MapToDto(config));
    }

    private static FeeConfigurationDto MapToDto(Domain.Entities.FeeConfiguration config) => new(
        config.Id,
        config.BaseFeeUsd,
        config.PerSeatFeeUsd,
        config.PerKgFeeUsd,
        config.OneTimeMultiplier,
        config.BlanketMultiplier,
        config.EmergencyMultiplier,
        config.IsActive,
        config.EffectiveFrom,
        config.EffectiveTo,
        config.ModifiedBy,
        config.Notes,
        config.CreatedAt,
        config.UpdatedAt);
}
