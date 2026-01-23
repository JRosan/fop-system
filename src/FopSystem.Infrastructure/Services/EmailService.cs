using FopSystem.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Retry;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace FopSystem.Infrastructure.Services;

public class EmailSettings
{
    public string Provider { get; set; } = "SendGrid";
    public string ApiKey { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = "noreply@bvicad.gov.vg";
    public string SenderName { get; set; } = "BVI Civil Aviation Department";
    public bool Enabled { get; set; } = true;
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;
    private readonly ISendGridClient? _sendGridClient;
    private readonly AsyncRetryPolicy _retryPolicy;

    public EmailService(
        IOptions<EmailSettings> settings,
        ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;

        // Initialize SendGrid client if API key is provided
        if (!string.IsNullOrEmpty(_settings.ApiKey))
        {
            _sendGridClient = new SendGridClient(_settings.ApiKey);
        }

        // Configure retry policy with exponential backoff
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
                onRetry: (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning(
                        exception,
                        "Email send attempt {RetryCount} failed. Retrying in {Delay}...",
                        retryCount,
                        timeSpan);
                });
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

        if (_sendGridClient == null || string.IsNullOrEmpty(_settings.ApiKey))
        {
            _logger.LogInformation("SendGrid not configured. Would send email to {To}: {Subject}", to, subject);
            return;
        }

        await _retryPolicy.ExecuteAsync(async () =>
        {
            var message = new SendGridMessage
            {
                From = new EmailAddress(_settings.SenderEmail, _settings.SenderName),
                Subject = subject
            };

            message.AddTo(new EmailAddress(to));

            if (isHtml)
            {
                message.HtmlContent = body;
                // Also add plain text version for email clients that don't support HTML
                message.PlainTextContent = StripHtml(body);
            }
            else
            {
                message.PlainTextContent = body;
            }

            var response = await _sendGridClient.SendEmailAsync(message, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Body.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "SendGrid returned non-success status code: {StatusCode}. Response: {ResponseBody}",
                    response.StatusCode,
                    responseBody);
                throw new InvalidOperationException($"Email send failed with status {response.StatusCode}");
            }

            _logger.LogInformation("Email sent successfully to {To}: {Subject}", to, subject);
        });
    }

    private static string StripHtml(string html)
    {
        // Simple HTML stripping - replace tags with spaces and decode entities
        var text = System.Text.RegularExpressions.Regex.Replace(html, "<[^>]+>", " ");
        text = System.Net.WebUtility.HtmlDecode(text);
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ");
        return text.Trim();
    }

    public async Task SendApplicationSubmittedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        CancellationToken cancellationToken = default)
    {
        var subject = $"FOP Application {applicationNumber} Submitted";
        var body = EmailTemplates.ApplicationSubmitted(
            applicationNumber,
            _settings.SenderName);

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendApplicationApprovedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        string permitNumber,
        CancellationToken cancellationToken = default)
    {
        var subject = $"FOP Application {applicationNumber} Approved";
        var body = EmailTemplates.ApplicationApproved(
            applicationNumber,
            permitNumber,
            _settings.SenderName);

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendApplicationRejectedEmailAsync(
        string operatorEmail,
        string applicationNumber,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var subject = $"FOP Application {applicationNumber} Rejected";
        var body = EmailTemplates.ApplicationRejected(
            applicationNumber,
            reason,
            _settings.SenderName);

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
        var body = EmailTemplates.InsuranceExpiryWarning(
            permitNumber,
            expiryDate,
            daysUntilExpiry,
            _settings.SenderName);

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendOfficerNewApplicationNotificationAsync(
        IEnumerable<string> officerEmails,
        string applicationNumber,
        string applicationType,
        string operatorName,
        decimal feeAmount,
        CancellationToken cancellationToken = default)
    {
        var subject = $"New FOP Application Submitted: {applicationNumber}";
        var body = EmailTemplates.OfficerNewApplication(
            applicationNumber,
            applicationType,
            operatorName,
            feeAmount,
            _settings.SenderName);

        foreach (var email in officerEmails)
        {
            await SendEmailAsync(email, subject, body, true, cancellationToken);
        }
    }

    public async Task SendBviaPaymentConfirmationEmailAsync(
        string operatorEmail,
        string invoiceNumber,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        var subject = $"BVIAA Payment Confirmation - Invoice {invoiceNumber}";
        var body = EmailTemplates.BviaPaymentConfirmation(
            invoiceNumber,
            amount);

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendBviaInvoiceOverdueEmailAsync(
        string operatorEmail,
        string invoiceNumber,
        decimal balanceDue,
        int daysOverdue,
        CancellationToken cancellationToken = default)
    {
        var urgency = daysOverdue >= 30 ? "URGENT: " : "";
        var subject = $"{urgency}BVIAA Invoice Overdue - {invoiceNumber}";
        var body = EmailTemplates.BviaInvoiceOverdue(
            invoiceNumber,
            balanceDue,
            daysOverdue);

        await SendEmailAsync(operatorEmail, subject, body, true, cancellationToken);
    }

    public async Task SendSubscriptionConfirmationEmailAsync(
        string email,
        string tenantName,
        string tier,
        bool isAnnual,
        DateTime subscriptionEndDate,
        CancellationToken cancellationToken = default)
    {
        var subject = $"FOP System Subscription Activated - {tier} Plan";
        var body = EmailTemplates.SubscriptionConfirmation(
            tenantName,
            tier,
            isAnnual,
            subscriptionEndDate,
            _settings.SenderName);

        await SendEmailAsync(email, subject, body, true, cancellationToken);
    }

    public async Task SendPaymentReceiptEmailAsync(
        string email,
        string invoiceId,
        decimal amount,
        string currency,
        DateTime paymentDate,
        CancellationToken cancellationToken = default)
    {
        var subject = "FOP System - Payment Receipt";
        var body = EmailTemplates.PaymentReceipt(
            invoiceId,
            amount,
            currency,
            paymentDate,
            _settings.SenderName);

        await SendEmailAsync(email, subject, body, true, cancellationToken);
    }
}

/// <summary>
/// Email template generator using consistent BVI branding.
/// </summary>
public static class EmailTemplates
{
    private const string PrimaryColor = "#002D56"; // bvi-atlantic
    private const string AccentColor = "#00A3B1";  // bvi-turquoise
    private const string GoldColor = "#C5A059";    // bvi-gold

    private static string WrapInTemplate(string content, string senderName)
    {
        return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>BVI FOP System</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F9FBFB;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FBFB;">
                    <tr>
                        <td style="padding: 40px 20px;">
                            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                                <!-- Header -->
                                <tr>
                                    <td style="background-color: {PrimaryColor}; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                                            BVI Foreign Operator Permit System
                                        </h1>
                                    </td>
                                </tr>
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 32px;">
                                        {content}
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 32px; border-top: 1px solid #E5E7EB; background-color: #F9FBFB; border-radius: 0 0 12px 12px;">
                                        <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">
                                            Best regards,<br/>
                                            <strong>{senderName}</strong>
                                        </p>
                                        <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                            This is an automated message from the BVI FOP System. Please do not reply directly to this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;
    }

    public static string ApplicationSubmitted(string applicationNumber, string senderName)
    {
        var content = $"""
            <h2 style="margin: 0 0 16px 0; color: {PrimaryColor}; font-size: 24px; font-weight: 600;">
                Application Submitted
            </h2>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Your Foreign Operator Permit application has been successfully submitted.
            </p>
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; color: #6B7280; font-size: 13px;">Application Number</p>
                <p style="margin: 4px 0 0 0; color: {PrimaryColor}; font-size: 18px; font-weight: 600;">{applicationNumber}</p>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Our team will review your application and you will be notified of any updates.
            </p>
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Thank you for your submission.
            </p>
            """;

        return WrapInTemplate(content, senderName);
    }

    public static string ApplicationApproved(string applicationNumber, string permitNumber, string senderName)
    {
        var content = $"""
            <div style="background-color: #D1FAE5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #065F46; font-size: 20px; font-weight: 600;">
                    &#10003; Application Approved
                </h2>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Congratulations! Your Foreign Operator Permit application has been approved.
            </p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                    <td style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; width: 48%;">
                        <p style="margin: 0; color: #6B7280; font-size: 13px;">Application Number</p>
                        <p style="margin: 4px 0 0 0; color: {PrimaryColor}; font-size: 16px; font-weight: 600;">{applicationNumber}</p>
                    </td>
                    <td style="width: 4%;"></td>
                    <td style="background-color: {AccentColor}20; border-radius: 8px; padding: 16px; width: 48%;">
                        <p style="margin: 0; color: {AccentColor}; font-size: 13px;">Permit Number</p>
                        <p style="margin: 4px 0 0 0; color: {PrimaryColor}; font-size: 16px; font-weight: 600;">{permitNumber}</p>
                    </td>
                </tr>
            </table>
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Your permit document is now available for download from the portal.
            </p>
            """;

        return WrapInTemplate(content, senderName);
    }

    public static string ApplicationRejected(string applicationNumber, string reason, string senderName)
    {
        var content = $"""
            <div style="background-color: #FEE2E2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #991B1B; font-size: 20px; font-weight: 600;">
                    Application Rejected
                </h2>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                We regret to inform you that your Foreign Operator Permit application has been rejected.
            </p>
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; color: #6B7280; font-size: 13px;">Application Number</p>
                <p style="margin: 4px 0 0 0; color: {PrimaryColor}; font-size: 16px; font-weight: 600;">{applicationNumber}</p>
            </div>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; color: #92400E; font-size: 13px; font-weight: 600;">Reason for Rejection</p>
                <p style="margin: 8px 0 0 0; color: #78350F; font-size: 14px; line-height: 1.5;">{reason}</p>
            </div>
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                If you have any questions, please contact our office.
            </p>
            """;

        return WrapInTemplate(content, senderName);
    }

    public static string InsuranceExpiryWarning(string permitNumber, DateOnly expiryDate, int daysUntilExpiry, string senderName)
    {
        var urgentStyle = daysUntilExpiry <= 7
            ? $"background-color: #FEE2E2; color: #991B1B;"
            : $"background-color: #FEF3C7; color: #92400E;";

        var content = $"""
            <div style="{urgentStyle} border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 600;">
                    &#9888; Insurance Expiry Warning
                </h2>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                This is a reminder that the insurance for your Foreign Operator Permit is expiring soon.
            </p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                    <td style="background-color: #F3F4F6; border-radius: 8px; padding: 16px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding: 8px 0;">
                                    <span style="color: #6B7280; font-size: 13px;">Permit Number:</span>
                                    <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{permitNumber}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;">
                                    <span style="color: #6B7280; font-size: 13px;">Insurance Expiry Date:</span>
                                    <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{expiryDate:MMMM dd, yyyy}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;">
                                    <span style="color: #6B7280; font-size: 13px;">Days Until Expiry:</span>
                                    <span style="color: {(daysUntilExpiry <= 7 ? "#DC2626" : GoldColor)}; font-size: 14px; font-weight: 600; margin-left: 8px;">{daysUntilExpiry} days</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Please update your insurance documentation as soon as possible to maintain your permit validity.
            </p>
            """;

        return WrapInTemplate(content, senderName);
    }

    public static string OfficerNewApplication(string applicationNumber, string applicationType, string operatorName, decimal feeAmount, string senderName)
    {
        var content = $"""
            <h2 style="margin: 0 0 16px 0; color: {PrimaryColor}; font-size: 24px; font-weight: 600;">
                New Application Requires Review
            </h2>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                A new Foreign Operator Permit application has been submitted and requires review.
            </p>
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Application Number:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{applicationNumber}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Application Type:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{applicationType}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Operator:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{operatorName}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Calculated Fee:</span>
                            <span style="color: {GoldColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">${feeAmount:N2} USD</span>
                        </td>
                    </tr>
                </table>
            </div>
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Please log in to the FOP System to review this application.
            </p>
            """;

        return WrapInTemplate(content, senderName);
    }

    public static string BviaPaymentConfirmation(string invoiceNumber, decimal amount)
    {
        var content = $"""
            <div style="background-color: #D1FAE5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #065F46; font-size: 20px; font-weight: 600;">
                    &#10003; Payment Confirmation
                </h2>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Thank you for your payment to the BVI Airports Authority.
            </p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                    <td style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; width: 48%;">
                        <p style="margin: 0; color: #6B7280; font-size: 13px;">Invoice Number</p>
                        <p style="margin: 4px 0 0 0; color: {PrimaryColor}; font-size: 16px; font-weight: 600;">{invoiceNumber}</p>
                    </td>
                    <td style="width: 4%;"></td>
                    <td style="background-color: {GoldColor}20; border-radius: 8px; padding: 16px; width: 48%;">
                        <p style="margin: 0; color: {GoldColor}; font-size: 13px;">Amount Paid</p>
                        <p style="margin: 4px 0 0 0; color: {PrimaryColor}; font-size: 16px; font-weight: 600;">${amount:N2} USD</p>
                    </td>
                </tr>
            </table>
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                This payment has been recorded and applied to your account.
            </p>
            <p style="margin: 16px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                If you have any questions about your invoice or payment, please contact the BVIAA Finance Department.
            </p>
            """;

        return WrapInTemplate(content, "BVI Airports Authority");
    }

    public static string BviaInvoiceOverdue(string invoiceNumber, decimal balanceDue, int daysOverdue)
    {
        var urgentStyle = daysOverdue >= 30
            ? "background-color: #FEE2E2; color: #991B1B;"
            : "background-color: #FEF3C7; color: #92400E;";

        var content = $"""
            <div style="{urgentStyle} border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 600;">
                    Invoice Overdue Notice
                </h2>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                This is to notify you that the following BVIAA invoice is overdue.
            </p>
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Invoice Number:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{invoiceNumber}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Outstanding Balance:</span>
                            <span style="color: #DC2626; font-size: 14px; font-weight: 600; margin-left: 8px;">${balanceDue:N2} USD</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Days Overdue:</span>
                            <span style="color: #DC2626; font-size: 14px; font-weight: 600; margin-left: 8px;">{daysOverdue} days</span>
                        </td>
                    </tr>
                </table>
            </div>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.5;">
                    <strong>Important:</strong> Overdue accounts may affect your eligibility for Foreign Operator Permit issuance.
                    Interest charges of 1.5% per month will be applied to invoices overdue more than 30 days.
                </p>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Please remit payment as soon as possible to avoid additional charges and permit processing delays.
            </p>
            <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                If you have any questions or believe this is an error, please contact the BVIAA Finance Department immediately.
            </p>
            """;

        return WrapInTemplate(content, "BVI Airports Authority");
    }

    public static string SubscriptionConfirmation(string tenantName, string tier, bool isAnnual, DateTime subscriptionEndDate, string senderName)
    {
        var billingCycle = isAnnual ? "Annual" : "Monthly";

        var content = $"""
            <div style="background-color: #D1FAE5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #065F46; font-size: 20px; font-weight: 600;">
                    &#10003; Subscription Activated
                </h2>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Welcome to the BVI Foreign Operator Permit System!
            </p>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Your subscription has been successfully activated.
            </p>
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Organization:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{tenantName}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Plan:</span>
                            <span style="color: {AccentColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{tier}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Billing Cycle:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{billingCycle}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Next Renewal:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{subscriptionEndDate:MMMM dd, yyyy}</span>
                        </td>
                    </tr>
                </table>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                You now have access to all features included in your plan. Log in to the system to get started.
            </p>
            <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                If you have any questions, please don't hesitate to contact our support team.
            </p>
            """;

        return WrapInTemplate(content, senderName);
    }

    public static string PaymentReceipt(string invoiceId, decimal amount, string currency, DateTime paymentDate, string senderName)
    {
        var content = $"""
            <h2 style="margin: 0 0 16px 0; color: {PrimaryColor}; font-size: 24px; font-weight: 600;">
                Payment Receipt
            </h2>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Thank you for your payment.
            </p>
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Invoice ID:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{invoiceId}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Amount:</span>
                            <span style="color: {GoldColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{amount:N2} {currency}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <span style="color: #6B7280; font-size: 13px;">Date:</span>
                            <span style="color: {PrimaryColor}; font-size: 14px; font-weight: 600; margin-left: 8px;">{paymentDate:MMMM dd, yyyy}</span>
                        </td>
                    </tr>
                </table>
            </div>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                This email serves as your receipt for the above payment.
            </p>
            <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                If you have any questions about this payment, please contact our support team.
            </p>
            """;

        return WrapInTemplate(content, senderName);
    }
}
