using FopSystem.Application.Audit.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class AuditEndpoints
{
    public static void MapAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/audit")
            .WithTags("Audit")
            .WithOpenApi()
            .AllowAnonymous(); // TODO: Add .RequireAuthorization("Admin") when auth is configured

        group.MapGet("/", GetAuditLogs)
            .WithName("GetAuditLogs")
            .WithSummary("Get paginated audit logs");

        group.MapGet("/{entityType}/{entityId:guid}", GetEntityAuditHistory)
            .WithName("GetEntityAuditHistory")
            .WithSummary("Get audit history for a specific entity");
    }

    private static async Task<IResult> GetAuditLogs(
        [FromServices] IMediator mediator,
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? entityId = null,
        [FromQuery] string? action = null,
        [FromQuery] string? userId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAuditLogsQuery(
            entityType,
            entityId,
            action,
            userId,
            fromDate,
            toDate,
            pageNumber,
            pageSize);

        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetEntityAuditHistory(
        [FromServices] IMediator mediator,
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEntityAuditHistoryQuery(entityType, entityId);
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }
}
