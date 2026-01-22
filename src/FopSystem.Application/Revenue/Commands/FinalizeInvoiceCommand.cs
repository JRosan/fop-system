using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Revenue.Commands;

public sealed record FinalizeInvoiceCommand(
    Guid InvoiceId,
    string FinalizedBy) : ICommand;

public sealed class FinalizeInvoiceCommandValidator : AbstractValidator<FinalizeInvoiceCommand>
{
    public FinalizeInvoiceCommandValidator()
    {
        RuleFor(x => x.InvoiceId).NotEmpty();
        RuleFor(x => x.FinalizedBy).NotEmpty().MaximumLength(100);
    }
}

public sealed class FinalizeInvoiceCommandHandler : ICommandHandler<FinalizeInvoiceCommand>
{
    private readonly IBviaInvoiceRepository _invoiceRepository;
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public FinalizeInvoiceCommandHandler(
        IBviaInvoiceRepository invoiceRepository,
        IOperatorAccountBalanceRepository accountBalanceRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _accountBalanceRepository = accountBalanceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(FinalizeInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId, cancellationToken);

        if (invoice is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            invoice.Finalize(request.FinalizedBy);

            // Update operator account balance
            var accountBalance = await _accountBalanceRepository.GetOrCreateAsync(
                invoice.OperatorId, cancellationToken);
            accountBalance.RecordInvoiceFinalized(invoice.TotalAmount);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("Invoice.FinalizeError", ex.Message));
        }
    }
}
