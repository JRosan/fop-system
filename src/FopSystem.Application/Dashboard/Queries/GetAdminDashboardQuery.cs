using FopSystem.Application.Common;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using UserRole = FopSystem.Domain.Aggregates.User.UserRole;

namespace FopSystem.Application.Dashboard.Queries;

public sealed record GetAdminDashboardQuery : IQuery<AdminDashboardDto>;

public sealed record AdminDashboardDto(
    SystemOverviewDto SystemOverview,
    UserStatisticsDto UserStatistics,
    ApplicationStatisticsDto ApplicationStatistics,
    IReadOnlyList<SystemAlertDto> SystemAlerts);

public sealed record SystemOverviewDto(
    int TotalApplications,
    int TotalOperators,
    int TotalPermits,
    int ActiveUsers);

public sealed record UserStatisticsDto(
    int TotalUsers,
    int ActiveUsers,
    int Applicants,
    int Reviewers,
    int Approvers,
    int FinanceOfficers,
    int Administrators);

public sealed record ApplicationStatisticsDto(
    int Draft,
    int Submitted,
    int UnderReview,
    int PendingDocuments,
    int PendingPayment,
    int Approved,
    int Rejected,
    int Expired);

public sealed record SystemAlertDto(
    string Type,
    string Message,
    string Severity,
    DateTime CreatedAt);

public sealed class GetAdminDashboardQueryHandler : IQueryHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IPermitRepository _permitRepository;
    private readonly IUserRepository _userRepository;

    public GetAdminDashboardQueryHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository,
        IPermitRepository permitRepository,
        IUserRepository userRepository)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
        _permitRepository = permitRepository;
        _userRepository = userRepository;
    }

    public async Task<Result<AdminDashboardDto>> Handle(
        GetAdminDashboardQuery request,
        CancellationToken cancellationToken)
    {
        // Get application statistics
        var (applications, totalApplications) = await _applicationRepository.GetPagedAsync(
            pageSize: 10000,
            cancellationToken: cancellationToken);

        var operators = await _operatorRepository.GetAllAsync(cancellationToken);
        var (permits, totalPermits) = await _permitRepository.GetPagedAsync(
            pageSize: 10000,
            cancellationToken: cancellationToken);
        var (users, totalUsers) = await _userRepository.GetPagedAsync(
            pageSize: 10000,
            cancellationToken: cancellationToken);

        var systemOverview = new SystemOverviewDto(
            totalApplications,
            operators.Count,
            totalPermits,
            users.Count(u => u.IsActive));

        var userStatistics = new UserStatisticsDto(
            totalUsers,
            users.Count(u => u.IsActive),
            users.Count(u => u.Role == UserRole.Applicant),
            users.Count(u => u.Role == UserRole.Reviewer),
            users.Count(u => u.Role == UserRole.Approver),
            users.Count(u => u.Role == UserRole.FinanceOfficer),
            users.Count(u => u.Role == UserRole.Administrator));

        var applicationStatistics = new ApplicationStatisticsDto(
            applications.Count(a => a.Status == ApplicationStatus.Draft),
            applications.Count(a => a.Status == ApplicationStatus.Submitted),
            applications.Count(a => a.Status == ApplicationStatus.UnderReview),
            applications.Count(a => a.Status == ApplicationStatus.PendingDocuments),
            applications.Count(a => a.Status == ApplicationStatus.PendingPayment),
            applications.Count(a => a.Status == ApplicationStatus.Approved),
            applications.Count(a => a.Status == ApplicationStatus.Rejected),
            applications.Count(a => a.Status == ApplicationStatus.Expired));

        // Generate system alerts
        var alerts = new List<SystemAlertDto>();

        var pendingCount = applications.Count(a =>
            a.Status == ApplicationStatus.Submitted &&
            (DateTime.UtcNow - (a.SubmittedAt ?? a.CreatedAt)).TotalDays > 7);
        if (pendingCount > 0)
        {
            alerts.Add(new SystemAlertDto(
                "PendingApplications",
                $"{pendingCount} applications pending review for more than 7 days",
                "Warning",
                DateTime.UtcNow));
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var expiringPermits = permits.Count(p =>
            p.Status == PermitStatus.Active &&
            p.ValidUntil >= today &&
            p.ValidUntil <= today.AddDays(30));
        if (expiringPermits > 0)
        {
            alerts.Add(new SystemAlertDto(
                "ExpiringPermits",
                $"{expiringPermits} permits expiring in the next 30 days",
                "Info",
                DateTime.UtcNow));
        }

        return Result.Success(new AdminDashboardDto(
            systemOverview,
            userStatistics,
            applicationStatistics,
            alerts));
    }
}
