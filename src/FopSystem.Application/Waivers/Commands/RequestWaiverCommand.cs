using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Waivers.Commands;

public sealed record RequestWaiverCommand(
    Guid ApplicationId,
    WaiverType WaiverType,
    string Reason,
    string RequestedBy) : ICommand<WaiverDto>;

public sealed record WaiverDto(
    Guid Id,
    Guid ApplicationId,
    string WaiverType,
    string Status,
    string Reason,
    string RequestedBy,
    DateTime RequestedAt,
    MoneyDto? WaivedAmount,
    decimal? WaiverPercentage,
    string? ApprovedBy,
    DateTime? ApprovedAt,
    string? RejectedBy,
    DateTime? RejectedAt,
    string? RejectionReason);

public sealed class RequestWaiverCommandValidator : AbstractValidator<RequestWaiverCommand>
{
    public RequestWaiverCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MinimumLength(20).MaximumLength(2000)
            .WithMessage("Waiver reason must be at least 20 characters to provide adequate justification");
        RuleFor(x => x.RequestedBy).NotEmpty().MaximumLength(200);
    }
}

public sealed class RequestWaiverCommandHandler : ICommandHandler<RequestWaiverCommand, WaiverDto>
{
    private readonly IApplicationRepository _applicationRepository;

    public RequestWaiverCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result<WaiverDto>> Handle(RequestWaiverCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure<WaiverDto>(Error.NotFound);
        }

        try
        {
            var waiver = application.RequestWaiver(request.WaiverType, request.Reason, request.RequestedBy);

            return Result.Success(MapToDto(waiver));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<WaiverDto>(
                Error.Custom("Waiver.InvalidOperation", ex.Message));
        }
    }

    private static WaiverDto MapToDto(FeeWaiver waiver) => new(
        waiver.Id,
        waiver.ApplicationId,
        waiver.Type.ToString(),
        waiver.Status.ToString(),
        waiver.Reason,
        waiver.RequestedBy,
        waiver.RequestedAt,
        waiver.WaivedAmount is not null
            ? new MoneyDto(waiver.WaivedAmount.Amount, waiver.WaivedAmount.Currency.ToString())
            : null,
        waiver.WaiverPercentage,
        waiver.ApprovedBy,
        waiver.ApprovedAt,
        waiver.RejectedBy,
        waiver.RejectedAt,
        waiver.RejectionReason);
}
