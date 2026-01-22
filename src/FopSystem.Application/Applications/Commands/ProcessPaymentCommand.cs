using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Commands;

public sealed record ProcessPaymentCommand(
    Guid ApplicationId,
    PaymentMethod Method,
    string TransactionReference) : ICommand<string>;

public sealed class ProcessPaymentCommandValidator : AbstractValidator<ProcessPaymentCommand>
{
    public ProcessPaymentCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.TransactionReference).NotEmpty().MaximumLength(100);
    }
}

public sealed class ProcessPaymentCommandHandler : ICommandHandler<ProcessPaymentCommand, string>
{
    private readonly IApplicationRepository _applicationRepository;

    public ProcessPaymentCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result<string>> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure<string>(Error.NotFound);
        }

        try
        {
            if (application.Payment is null)
            {
                application.RequestPayment(request.Method);
            }

            var receiptNumber = $"RCP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
            application.CompletePayment(request.TransactionReference, receiptNumber);

            return Result.Success(receiptNumber);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<string>(Error.Custom("Payment.InvalidOperation", ex.Message));
        }
    }
}
