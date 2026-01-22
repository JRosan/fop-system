using FopSystem.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FopSystem.Infrastructure.Services;

public class OfficerNotificationSettings
{
    public List<string> ReviewerEmails { get; set; } = [];
    public List<string> ApproverEmails { get; set; } = [];
    public List<string> FinanceOfficerEmails { get; set; } = [];
}

public class OfficerNotificationService : IOfficerNotificationService
{
    private readonly OfficerNotificationSettings _settings;
    private readonly ILogger<OfficerNotificationService> _logger;

    public OfficerNotificationService(
        IOptions<OfficerNotificationSettings> settings,
        ILogger<OfficerNotificationService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public Task<IReadOnlyList<string>> GetReviewerEmailsAsync(CancellationToken cancellationToken = default)
    {
        // In production, this would query the user database for users with Reviewer role
        // For now, we use configuration-based emails
        _logger.LogDebug("Fetching reviewer emails, found {Count} configured", _settings.ReviewerEmails.Count);
        return Task.FromResult<IReadOnlyList<string>>(_settings.ReviewerEmails);
    }

    public Task<IReadOnlyList<string>> GetApproverEmailsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Fetching approver emails, found {Count} configured", _settings.ApproverEmails.Count);
        return Task.FromResult<IReadOnlyList<string>>(_settings.ApproverEmails);
    }

    public Task<IReadOnlyList<string>> GetFinanceOfficerEmailsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Fetching finance officer emails, found {Count} configured", _settings.FinanceOfficerEmails.Count);
        return Task.FromResult<IReadOnlyList<string>>(_settings.FinanceOfficerEmails);
    }
}
