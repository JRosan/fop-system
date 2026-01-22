namespace FopSystem.Application.Interfaces;

public interface IOfficerNotificationService
{
    Task<IReadOnlyList<string>> GetReviewerEmailsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetApproverEmailsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetFinanceOfficerEmailsAsync(CancellationToken cancellationToken = default);
}
