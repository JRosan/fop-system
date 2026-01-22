using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Audit.Queries;

public sealed record GetEntityAuditHistoryQuery(
    string EntityType,
    Guid EntityId) : IQuery<IReadOnlyList<AuditLogDto>>;

public sealed class GetEntityAuditHistoryQueryHandler : IQueryHandler<GetEntityAuditHistoryQuery, IReadOnlyList<AuditLogDto>>
{
    private readonly IAuditLogRepository _auditLogRepository;

    public GetEntityAuditHistoryQueryHandler(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<Result<IReadOnlyList<AuditLogDto>>> Handle(
        GetEntityAuditHistoryQuery request,
        CancellationToken cancellationToken)
    {
        var items = await _auditLogRepository.GetByEntityAsync(
            request.EntityType,
            request.EntityId,
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

        return Result.Success<IReadOnlyList<AuditLogDto>>(dtos);
    }
}
