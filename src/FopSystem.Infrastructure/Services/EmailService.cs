using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FopSystem.Infrastructure.Services;

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
}

public class EmailSettings
{
    public string SenderEmail { get; set; } = "noreply@bvicad.gov.vg";
    public string SenderName { get; set; } = "BVI Civil Aviation Department";
    public bool Enabled { get; set; } = true;
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<EmailSettings> settings,
        ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            _logger.LogDebug("Email sending is disabled. Would send to {To}: {Subject}", to, subject);
            return;
        }

        _logger.LogInformation("Sending email to {To}: {Subject}", to, subject);

        // In production, this would use Microsoft Graph API or Azure Communication Services
        // For now, we just log the email details
        await Task.CompletedTask;
    }

    public async Task SendApplicationSubmittedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        CancellationToken cancellationToken = default)
    {
        var subject = $"FOP Application {applicationNumber} Submitted";
        var body = $"""
            <html>
            <body>
            <h2>Application Submitted</h2>
            <p>Your Foreign Operator Permit application has been successfully submitted.</p>
            <p><strong>Application Number:</strong> {applicationNumber}</p>
            <p>Our team will review your application and you will be notified of any updates.</p>
            <p>Thank you for your submission.</p>
            <br/>
            <p>Best regards,<br/>{_settings.SenderName}</p>
            </body>
            </html>
            """;

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendApplicationApprovedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        string permitNumber,
        CancellationToken cancellationToken = default)
    {
        var subject = $"FOP Application {applicationNumber} Approved";
        var body = $"""
            <html>
            <body>
            <h2>Application Approved</h2>
            <p>Congratulations! Your Foreign Operator Permit application has been approved.</p>
            <p><strong>Application Number:</strong> {applicationNumber}</p>
            <p><strong>Permit Number:</strong> {permitNumber}</p>
            <p>Your permit document is now available for download from the portal.</p>
            <br/>
            <p>Best regards,<br/>{_settings.SenderName}</p>
            </body>
            </html>
            """;

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendApplicationRejectedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var subject = $"FOP Application {applicationNumber} Rejected";
        var body = $"""
            <html>
            <body>
            <h2>Application Rejected</h2>
            <p>We regret to inform you that your Foreign Operator Permit application has been rejected.</p>
            <p><strong>Application Number:</strong> {applicationNumber}</p>
            <p><strong>Reason:</strong> {reason}</p>
            <p>If you have any questions, please contact our office.</p>
            <br/>
            <p>Best regards,<br/>{_settings.SenderName}</p>
            </body>
            </html>
            """;

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendInsuranceExpiryWarningEmailAsync(
        string operatorEmail,
        string permitNumber,
        DateOnly expiryDate,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default)
    {
        var urgency = daysUntilExpiry <= 7 ? "URGENT: " : "";
        var subject = $"{urgency}Insurance Expiry Warning - Permit {permitNumber}";
        var body = $"""
            <html>
            <body>
            <h2>Insurance Expiry Warning</h2>
            <p>This is a reminder that the insurance for your Foreign Operator Permit is expiring soon.</p>
            <p><strong>Permit Number:</strong> {permitNumber}</p>
            <p><strong>Insurance Expiry Date:</strong> {expiryDate:MMMM dd, yyyy}</p>
            <p><strong>Days Until Expiry:</strong> {daysUntilExpiry} days</p>
            <p>Please update your insurance documentation as soon as possible to maintain your permit validity.</p>
            <br/>
            <p>Best regards,<br/>{_settings.SenderName}</p>
            </body>
            </html>
            """;

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }
}
