using FopSystem.Application.Common;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Dashboard.Queries;

public sealed record GetReviewerDashboardQuery : IQuery<ReviewerDashboardDto>;

public sealed record ReviewerDashboardDto(
    int PendingReviews,
    int CompletedToday,
    int CompletedThisWeek,
    int DocumentsPendingVerification,
    IReadOnlyList<PendingReviewDto> PendingApplications,
    IReadOnlyList<RecentDecisionDto> RecentDecisions);

public sealed record PendingReviewDto(
    Guid ApplicationId,
    string ApplicationNumber,
    string OperatorName,
    string Type,
    DateTime SubmittedAt,
    int DaysPending);

public sealed record RecentDecisionDto(
    Guid ApplicationId,
    string ApplicationNumber,
    string Decision,
    DateTime DecisionDate);

public sealed class GetReviewerDashboardQueryHandler : IQueryHandler<GetReviewerDashboardQuery, ReviewerDashboardDto>
{
    private readonly IApplicationRepository _applicationRepository;

    public GetReviewerDashboardQueryHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result<ReviewerDashboardDto>> Handle(
        GetReviewerDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek);

        // Get applications needing review
        var (pendingApps, pendingCount) = await _applicationRepository.GetPagedAsync(
            statuses: [ApplicationStatus.Submitted, ApplicationStatus.UnderReview],
            pageSize: 100,
            cancellationToken: cancellationToken);

        var pendingApplications = pendingApps
            .OrderBy(a => a.SubmittedAt)
            .Take(10)
            .Select(a => new PendingReviewDto(
                a.Id,
                a.ApplicationNumber,
                a.Operator?.Name ?? "Unknown",
                a.Type.ToString(),
                a.SubmittedAt ?? a.CreatedAt,
                (int)(DateTime.UtcNow - (a.SubmittedAt ?? a.CreatedAt)).TotalDays))
            .ToList();

        // Get completed reviews (approved + rejected)
        var (completedApps, _) = await _applicationRepository.GetPagedAsync(
            statuses: [ApplicationStatus.Approved, ApplicationStatus.Rejected, ApplicationStatus.PendingPayment],
            pageSize: 100,
            cancellationToken: cancellationToken);

        var completedToday = completedApps.Count(a =>
            a.UpdatedAt.Date == today);
        var completedThisWeek = completedApps.Count(a =>
            a.UpdatedAt >= weekStart);

        var recentDecisions = completedApps
            .OrderByDescending(a => a.UpdatedAt)
            .Take(5)
            .Select(a => new RecentDecisionDto(
                a.Id,
                a.ApplicationNumber,
                a.Status.ToString(),
                a.UpdatedAt))
            .ToList();

        // Get documents pending verification
        var documentsPending = pendingApps
            .Where(a => a.Documents != null)
            .SelectMany(a => a.Documents)
            .Count(d => d.Status == DocumentStatus.Pending);

        return Result.Success(new ReviewerDashboardDto(
            pendingCount,
            completedToday,
            completedThisWeek,
            documentsPending,
            pendingApplications,
            recentDecisions));
    }
}
