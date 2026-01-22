using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.Revenue.Commands;

public sealed record RecordBviaPaymentCommand(
    Guid InvoiceId,
    decimal Amount,
    PaymentMethod Method,
    string? TransactionReference,
    string? Notes,
    string RecordedBy) : ICommand<BviaPaymentDto>;

public sealed class RecordBviaPaymentCommandValidator : AbstractValidator<RecordBviaPaymentCommand>
{
    public RecordBviaPaymentCommandValidator()
    {
        RuleFor(x => x.InvoiceId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.RecordedBy).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TransactionReference).MaximumLength(100);
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}

public sealed class RecordBviaPaymentCommandHandler : ICommandHandler<RecordBviaPaymentCommand, BviaPaymentDto>
{
    private readonly IBviaInvoiceRepository _invoiceRepository;
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RecordBviaPaymentCommandHandler(
        IBviaInvoiceRepository invoiceRepository,
        IOperatorAccountBalanceRepository accountBalanceRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _accountBalanceRepository = accountBalanceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BviaPaymentDto>> Handle(RecordBviaPaymentCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId, cancellationToken);

        if (invoice is null)
        {
            return Result.Failure<BviaPaymentDto>(Error.NotFound);
        }

        try
        {
            var amount = Money.Usd(request.Amount);
            var wasOverdue = invoice.Status == BviaInvoiceStatus.Overdue;
            var previousBalanceDue = invoice.BalanceDue;

            var payment = invoice.RecordPayment(
                amount: amount,
                method: request.Method,
                transactionReference: request.TransactionReference,
                notes: request.Notes,
                recordedBy: request.RecordedBy);

            // Update operator account balance
            var accountBalance = await _accountBalanceRepository.GetOrCreateAsync(
                invoice.OperatorId, cancellationToken);
            accountBalance.RecordPayment(amount);

            // If invoice is now paid, update paid count
            if (invoice.Status == BviaInvoiceStatus.Paid)
            {
                accountBalance.RecordInvoicePaid();

                // If was overdue, clear the overdue amount
                if (wasOverdue)
                {
                    accountBalance.RecordOverdueCleared(previousBalanceDue);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(new BviaPaymentDto(
                Id: payment.Id,
                Amount: new MoneyDto(payment.Amount.Amount, payment.Amount.Currency.ToString()),
                Method: payment.Method,
                Status: payment.Status,
                TransactionReference: payment.TransactionReference,
                PaymentDate: payment.PaymentDate,
                ReceiptNumber: payment.ReceiptNumber,
                Notes: payment.Notes,
                RecordedBy: payment.RecordedBy,
                RecordedAt: payment.RecordedAt));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<BviaPaymentDto>(Error.Custom("Payment.RecordError", ex.Message));
        }
    }
}
