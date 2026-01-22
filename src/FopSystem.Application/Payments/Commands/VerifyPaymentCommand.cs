using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Payments.Commands;

public sealed record VerifyPaymentCommand(
    Guid ApplicationId,
    string VerifiedBy,
    string? Notes = null) : ICommand;

public sealed class VerifyPaymentCommandValidator : AbstractValidator<VerifyPaymentCommand>
{
    public VerifyPaymentCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.VerifiedBy).NotEmpty();
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}

public sealed class VerifyPaymentCommandHandler : ICommandHandler<VerifyPaymentCommand>
{
    private readonly IApplicationRepository _applicationRepository;

    public VerifyPaymentCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);

        if (application is null)
        {
            return Result.Failure(Error.NotFound);
        }

        if (application.Payment is null)
        {
            return Result.Failure(Error.Custom("Payment.NotFound", "No payment exists for this application"));
        }

        try
        {
            application.Payment.Verify(request.VerifiedBy, request.Notes);
            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("Payment.InvalidOperation", ex.Message));
        }
    }
}
