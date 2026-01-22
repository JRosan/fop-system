using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Audit.Queries;

public sealed record GetAuditLogsQuery(
    string? EntityType = null,
    Guid? EntityId = null,
    string? Action = null,
    string? UserId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int PageNumber = 1,
    int PageSize = 20) : IQuery<PagedResult<AuditLogDto>>;

public sealed record AuditLogDto(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string Action,
    string? OldValues,
    string? NewValues,
    string? UserId,
    string? UserEmail,
    string? IpAddress,
    DateTime CreatedAt);

public sealed class GetAuditLogsQueryHandler : IQueryHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IAuditLogRepository _auditLogRepository;

    public GetAuditLogsQueryHandler(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<Result<PagedResult<AuditLogDto>>> Handle(
        GetAuditLogsQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _auditLogRepository.GetPagedAsync(
            request.EntityType,
            request.EntityId,
            request.Action,
            request.UserId,
            request.FromDate,
            request.ToDate,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(a => new AuditLogDto(
            a.Id,
            a.EntityType,
            a.EntityId,
            a.Action,
            a.OldValues,
            a.NewValues,
            a.UserId,
            a.UserEmail,
            a.IpAddress,
            a.CreatedAt)).ToList();

        return Result.Success(new PagedResult<AuditLogDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize));
    }
}
