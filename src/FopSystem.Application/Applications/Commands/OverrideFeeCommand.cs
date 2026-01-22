using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.Applications.Commands;

public sealed record OverrideFeeCommand(
    Guid ApplicationId,
    decimal NewFeeAmount,
    Currency Currency,
    string OverriddenBy,
    string Justification) : ICommand<FeeOverrideResultDto>;

public sealed record FeeOverrideResultDto(
    Guid ApplicationId,
    MoneyDto OriginalFee,
    MoneyDto NewFee,
    string OverriddenBy,
    string Justification,
    DateTime OverriddenAt);

public sealed class OverrideFeeCommandValidator : AbstractValidator<OverrideFeeCommand>
{
    public OverrideFeeCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.NewFeeAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.OverriddenBy).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Justification).NotEmpty().MinimumLength(10).MaximumLength(2000)
            .WithMessage("Justification must be at least 10 characters to provide adequate reasoning");
    }
}

public sealed class OverrideFeeCommandHandler : ICommandHandler<OverrideFeeCommand, FeeOverrideResultDto>
{
    private readonly IApplicationRepository _applicationRepository;

    public OverrideFeeCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result<FeeOverrideResultDto>> Handle(OverrideFeeCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure<FeeOverrideResultDto>(Error.NotFound);
        }

        try
        {
            var originalFee = application.CalculatedFee;
            var newFee = Money.Create(request.NewFeeAmount, request.Currency);

            application.OverrideFee(newFee, request.OverriddenBy, request.Justification);

            return Result.Success(new FeeOverrideResultDto(
                application.Id,
                new MoneyDto(originalFee.Amount, originalFee.Currency.ToString()),
                new MoneyDto(newFee.Amount, newFee.Currency.ToString()),
                request.OverriddenBy,
                request.Justification,
                DateTime.UtcNow));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<FeeOverrideResultDto>(
                Error.Custom("FeeOverride.InvalidOperation", ex.Message));
        }
    }
}
