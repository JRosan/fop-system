using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Waivers.Commands;

public sealed record ApproveWaiverCommand(
    Guid ApplicationId,
    Guid WaiverId,
    string ApprovedBy,
    decimal WaiverPercentage) : ICommand<WaiverApprovalResultDto>;

public sealed record WaiverApprovalResultDto(
    Guid WaiverId,
    Guid ApplicationId,
    MoneyDto OriginalFee,
    MoneyDto WaivedAmount,
    MoneyDto NewFee,
    decimal WaiverPercentage,
    string ApprovedBy,
    DateTime ApprovedAt);

public sealed class ApproveWaiverCommandValidator : AbstractValidator<ApproveWaiverCommand>
{
    public ApproveWaiverCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.WaiverId).NotEmpty();
        RuleFor(x => x.ApprovedBy).NotEmpty().MaximumLength(200);
        RuleFor(x => x.WaiverPercentage)
            .InclusiveBetween(0, 100)
            .WithMessage("Waiver percentage must be between 0 and 100");
    }
}

public sealed class ApproveWaiverCommandHandler : ICommandHandler<ApproveWaiverCommand, WaiverApprovalResultDto>
{
    private readonly IApplicationRepository _applicationRepository;

    public ApproveWaiverCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result<WaiverApprovalResultDto>> Handle(ApproveWaiverCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure<WaiverApprovalResultDto>(Error.NotFound);
        }

        try
        {
            var originalFee = application.CalculatedFee;

            application.ApproveWaiver(request.WaiverId, request.ApprovedBy, request.WaiverPercentage);

            var waivedAmount = originalFee.Multiply(request.WaiverPercentage / 100);
            var newFee = application.CalculatedFee;

            return Result.Success(new WaiverApprovalResultDto(
                request.WaiverId,
                request.ApplicationId,
                new MoneyDto(originalFee.Amount, originalFee.Currency.ToString()),
                new MoneyDto(waivedAmount.Amount, waivedAmount.Currency.ToString()),
                new MoneyDto(newFee.Amount, newFee.Currency.ToString()),
                request.WaiverPercentage,
                request.ApprovedBy,
                DateTime.UtcNow));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<WaiverApprovalResultDto>(
                Error.Custom("Waiver.InvalidOperation", ex.Message));
        }
    }
}
