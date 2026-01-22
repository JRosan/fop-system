using FopSystem.Application.Interfaces;
using FopSystem.Domain.Events;
using FopSystem.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace FopSystem.Application.Revenue.EventHandlers;

public sealed class BviaPaymentReceivedHandler : INotificationHandler<BviaPaymentReceivedEvent>
{
    private readonly IOperatorRepository _operatorRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<BviaPaymentReceivedHandler> _logger;

    public BviaPaymentReceivedHandler(
        IOperatorRepository operatorRepository,
        IEmailService emailService,
        ILogger<BviaPaymentReceivedHandler> logger)
    {
        _operatorRepository = operatorRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Handle(BviaPaymentReceivedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling BviaPaymentReceivedEvent for invoice {InvoiceNumber}, payment {PaymentId}",
            notification.InvoiceNumber, notification.PaymentId);

        try
        {
            var @operator = await _operatorRepository.GetByIdAsync(notification.OperatorId, cancellationToken);
            if (@operator is null)
            {
                _logger.LogWarning("Operator {OperatorId} not found", notification.OperatorId);
                return;
            }

            // Send payment confirmation email
            await _emailService.SendBviaPaymentConfirmationEmailAsync(
                @operator.ContactInfo.Email,
                notification.InvoiceNumber,
                notification.Amount.Amount,
                cancellationToken);

            _logger.LogInformation(
                "Sent BVIAA payment confirmation to {Email} for invoice {InvoiceNumber}",
                @operator.ContactInfo.Email, notification.InvoiceNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error handling BviaPaymentReceivedEvent for invoice {InvoiceNumber}",
                notification.InvoiceNumber);
        }
    }
}
