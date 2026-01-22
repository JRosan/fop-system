using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.FeeConfiguration.Commands;

public sealed record UpdateFeeConfigurationCommand(
    Guid Id,
    decimal? BaseFeeUsd = null,
    decimal? PerSeatFeeUsd = null,
    decimal? PerKgFeeUsd = null,
    decimal? OneTimeMultiplier = null,
    decimal? BlanketMultiplier = null,
    decimal? EmergencyMultiplier = null,
    string? ModifiedBy = null,
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null,
    string? Notes = null) : ICommand<FeeConfigurationDto>;

public sealed class UpdateFeeConfigurationCommandValidator : AbstractValidator<UpdateFeeConfigurationCommand>
{
    public UpdateFeeConfigurationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.BaseFeeUsd).GreaterThanOrEqualTo(0).When(x => x.BaseFeeUsd.HasValue);
        RuleFor(x => x.PerSeatFeeUsd).GreaterThanOrEqualTo(0).When(x => x.PerSeatFeeUsd.HasValue);
        RuleFor(x => x.PerKgFeeUsd).GreaterThanOrEqualTo(0).When(x => x.PerKgFeeUsd.HasValue);
        RuleFor(x => x.OneTimeMultiplier).GreaterThan(0).When(x => x.OneTimeMultiplier.HasValue);
        RuleFor(x => x.BlanketMultiplier).GreaterThan(0).When(x => x.BlanketMultiplier.HasValue);
        RuleFor(x => x.EmergencyMultiplier).GreaterThan(0).When(x => x.EmergencyMultiplier.HasValue);
        RuleFor(x => x.ModifiedBy).MaximumLength(256).When(x => x.ModifiedBy is not null);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes is not null);
    }
}

public sealed class UpdateFeeConfigurationCommandHandler : ICommandHandler<UpdateFeeConfigurationCommand, FeeConfigurationDto>
{
    private readonly IFeeConfigurationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFeeConfigurationCommandHandler(
        IFeeConfigurationRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<FeeConfigurationDto>> Handle(
        UpdateFeeConfigurationCommand request,
        CancellationToken cancellationToken)
    {
        var config = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (config is null)
        {
            return Result.Failure<FeeConfigurationDto>(Error.NotFound);
        }

        config.Update(
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
