using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Payments.Commands;

public sealed record RefundPaymentCommand(
    Guid ApplicationId,
    string RefundedBy,
    string Reason) : ICommand<RefundResultDto>;

public sealed record RefundResultDto(
    Guid PaymentId,
    decimal RefundedAmount,
    string Currency,
    string RefundedBy,
    DateTime RefundedAt);

public sealed class RefundPaymentCommandValidator : AbstractValidator<RefundPaymentCommand>
{
    public RefundPaymentCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.RefundedBy).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
    }
}

public sealed class RefundPaymentCommandHandler : ICommandHandler<RefundPaymentCommand, RefundResultDto>
{
    private readonly IApplicationRepository _applicationRepository;

    public RefundPaymentCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result<RefundResultDto>> Handle(RefundPaymentCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure<RefundResultDto>(Error.NotFound);
        }

        if (application.Payment is null)
        {
            return Result.Failure<RefundResultDto>(
                Error.Custom("Payment.NotFound", "No payment exists for this application"));
        }

        try
        {
            var amount = application.Payment.Amount;
            var paymentId = application.Payment.Id;

            application.RefundPayment(request.RefundedBy, request.Reason);

            return Result.Success(new RefundResultDto(
                paymentId,
                amount.Amount,
                amount.Currency.ToString(),
                request.RefundedBy,
                DateTime.UtcNow));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<RefundResultDto>(
                Error.Custom("Refund.InvalidOperation", ex.Message));
        }
    }
}
