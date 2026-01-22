using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Waivers.Commands;

public sealed record RejectWaiverCommand(
    Guid ApplicationId,
    Guid WaiverId,
    string RejectedBy,
    string Reason) : ICommand;

public sealed class RejectWaiverCommandValidator : AbstractValidator<RejectWaiverCommand>
{
    public RejectWaiverCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.WaiverId).NotEmpty();
        RuleFor(x => x.RejectedBy).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Reason).NotEmpty().MinimumLength(10).MaximumLength(1000)
            .WithMessage("Rejection reason must be at least 10 characters");
    }
}

public sealed class RejectWaiverCommandHandler : ICommandHandler<RejectWaiverCommand>
{
    private readonly IApplicationRepository _applicationRepository;

    public RejectWaiverCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result> Handle(RejectWaiverCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            application.RejectWaiver(request.WaiverId, request.RejectedBy, request.Reason);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("Waiver.InvalidOperation", ex.Message));
        }
    }
}
