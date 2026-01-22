using FopSystem.Application.Interfaces;
using FopSystem.Domain.Events;
using FopSystem.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace FopSystem.Application.EventHandlers;

public sealed class ApplicationSubmittedEventHandler : INotificationHandler<ApplicationSubmittedEvent>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IEmailService _emailService;
    private readonly IOfficerNotificationService _officerNotificationService;
    private readonly ILogger<ApplicationSubmittedEventHandler> _logger;

    public ApplicationSubmittedEventHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository,
        IEmailService emailService,
        IOfficerNotificationService officerNotificationService,
        ILogger<ApplicationSubmittedEventHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
        _emailService = emailService;
        _officerNotificationService = officerNotificationService;
        _logger = logger;
    }

    public async Task Handle(ApplicationSubmittedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling ApplicationSubmittedEvent for application {ApplicationId} ({ApplicationNumber})",
            notification.ApplicationId, notification.ApplicationNumber);

        try
        {
            // Get application and operator details
            var application = await _applicationRepository.GetByIdAsync(notification.ApplicationId, cancellationToken);
            if (application is null)
            {
                _logger.LogWarning("Application {ApplicationId} not found", notification.ApplicationId);
                return;
            }

            var @operator = await _operatorRepository.GetByIdAsync(application.OperatorId, cancellationToken);
            if (@operator is null)
            {
                _logger.LogWarning("Operator {OperatorId} not found for application {ApplicationId}",
                    application.OperatorId, notification.ApplicationId);
                return;
            }

            // Send confirmation to the applicant
            await _emailService.SendApplicationSubmittedEmailAsync(
                @operator.ContactInfo.Email,
                notification.ApplicationNumber,
                cancellationToken);

            _logger.LogInformation(
                "Sent application submitted confirmation to operator {OperatorEmail}",
                @operator.ContactInfo.Email);

            // Notify officers
            var reviewerEmails = await _officerNotificationService.GetReviewerEmailsAsync(cancellationToken);
            if (reviewerEmails.Count > 0)
            {
                await _emailService.SendOfficerNewApplicationNotificationAsync(
                    reviewerEmails,
                    notification.ApplicationNumber,
                    application.Type.ToString(),
                    @operator.Name,
                    notification.CalculatedFee.Amount,
                    cancellationToken);

                _logger.LogInformation(
                    "Sent new application notification to {Count} reviewers",
                    reviewerEmails.Count);
            }
            else
            {
                _logger.LogWarning("No reviewer emails configured, skipping officer notifications");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error handling ApplicationSubmittedEvent for application {ApplicationId}",
                notification.ApplicationId);
            // Don't rethrow - we don't want notification failures to break the application submission
        }
    }
}
