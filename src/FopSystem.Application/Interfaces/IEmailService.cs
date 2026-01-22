namespace FopSystem.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default);

    Task SendApplicationSubmittedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        CancellationToken cancellationToken = default);

    Task SendApplicationApprovedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        string permitNumber,
        CancellationToken cancellationToken = default);

    Task SendApplicationRejectedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        string reason,
        CancellationToken cancellationToken = default);

    Task SendInsuranceExpiryWarningEmailAsync(
        string operatorEmail,
        string permitNumber,
        DateOnly expiryDate,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default);

    Task SendOfficerNewApplicationNotificationAsync(
        IEnumerable<string> officerEmails,
        string applicationNumber,
        string applicationType,
        string operatorName,
        decimal feeAmount,
        CancellationToken cancellationToken = default);
}
