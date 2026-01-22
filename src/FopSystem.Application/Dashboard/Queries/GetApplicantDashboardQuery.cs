using FopSystem.Application.Common;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Dashboard.Queries;

public sealed record GetApplicantDashboardQuery(Guid OperatorId) : IQuery<ApplicantDashboardDto>;

public sealed record ApplicantDashboardDto(
    int TotalApplications,
    int PendingApplications,
    int ApprovedApplications,
    int RejectedApplications,
    int ActivePermits,
    int ExpiringPermits,
    IReadOnlyList<RecentApplicationDto> RecentApplications,
    IReadOnlyList<UpcomingExpiryDto> UpcomingExpiries);

public sealed record RecentApplicationDto(
    Guid Id,
    string ApplicationNumber,
    string Type,
    string Status,
    DateTime SubmittedAt);

public sealed record UpcomingExpiryDto(
    Guid Id,
    string Type,
    string Description,
    DateOnly ExpiryDate,
    int DaysUntilExpiry);

public sealed class GetApplicantDashboardQueryHandler : IQueryHandler<GetApplicantDashboardQuery, ApplicantDashboardDto>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IPermitRepository _permitRepository;

    public GetApplicantDashboardQueryHandler(
        IApplicationRepository applicationRepository,
        IPermitRepository permitRepository)
    {
        _applicationRepository = applicationRepository;
        _permitRepository = permitRepository;
    }

    public async Task<Result<ApplicantDashboardDto>> Handle(
        GetApplicantDashboardQuery request,
        CancellationToken cancellationToken)
    {
        // Get application statistics
        var (applications, totalCount) = await _applicationRepository.GetPagedAsync(
            operatorId: request.OperatorId,
            pageSize: 1000,
            cancellationToken: cancellationToken);

        var pendingCount = applications.Count(a =>
            a.Status == ApplicationStatus.Draft ||
            a.Status == ApplicationStatus.Submitted ||
            a.Status == ApplicationStatus.UnderReview ||
            a.Status == ApplicationStatus.PendingDocuments ||
            a.Status == ApplicationStatus.PendingPayment);
        var approvedCount = applications.Count(a => a.Status == ApplicationStatus.Approved);
        var rejectedCount = applications.Count(a => a.Status == ApplicationStatus.Rejected);

        // Get recent applications
        var recentApplications = applications
            .OrderByDescending(a => a.SubmittedAt ?? a.CreatedAt)
            .Take(5)
            .Select(a => new RecentApplicationDto(
                a.Id,
                a.ApplicationNumber,
                a.Type.ToString(),
                a.Status.ToString(),
                a.SubmittedAt ?? a.CreatedAt))
            .ToList();

        // Get permits
        var (permits, _) = await _permitRepository.GetPagedAsync(
            operatorId: request.OperatorId,
            pageSize: 1000,
            cancellationToken: cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var thirtyDaysLater = today.AddDays(30);

        var activePermits = permits.Count(p => p.Status == PermitStatus.Active && p.ValidUntil >= today);
        var expiringPermits = permits.Count(p =>
            p.Status == PermitStatus.Active &&
            p.ValidUntil >= today &&
            p.ValidUntil <= thirtyDaysLater);

        var upcomingExpiries = permits
            .Where(p => p.Status == PermitStatus.Active && p.ValidUntil >= today && p.ValidUntil <= thirtyDaysLater)
            .OrderBy(p => p.ValidUntil)
            .Take(5)
            .Select(p => new UpcomingExpiryDto(
                p.Id,
                "Permit",
                $"Permit {p.PermitNumber}",
                p.ValidUntil,
                p.ValidUntil.DayNumber - today.DayNumber))
            .ToList();

        return Result.Success(new ApplicantDashboardDto(
            totalCount,
            pendingCount,
            approvedCount,
            rejectedCount,
            activePermits,
            expiringPermits,
            recentApplications,
            upcomingExpiries));
    }
}
