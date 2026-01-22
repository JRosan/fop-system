using FopSystem.Application.DTOs;
using FopSystem.Application.Permits.Queries;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class PermitEndpoints
{
    public static void MapPermitEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/permits")
            .WithTags("Permits")
            .WithOpenApi();

        group.MapGet("/", GetPermits)
            .WithName("GetPermits")
            .WithSummary("Get paginated list of permits");

        group.MapGet("/{id:guid}", GetPermitById)
            .WithName("GetPermitById")
            .WithSummary("Get permit by ID")
            .Produces<PermitDto>()
            .Produces(404);

        group.MapGet("/number/{permitNumber}", GetPermitByNumber)
            .WithName("GetPermitByNumber")
            .WithSummary("Get permit by permit number")
            .Produces<PermitDto>()
            .Produces(404);

        group.MapGet("/verify/{permitNumber}", VerifyPermit)
            .WithName("VerifyPermit")
            .WithSummary("Verify if a permit is valid")
            .Produces<PermitVerificationDto>();

        group.MapPost("/{id:guid}/revoke", RevokePermit)
            .WithName("RevokePermit")
            .WithSummary("Revoke a permit")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .RequireAuthorization("Admin");

        group.MapPost("/{id:guid}/suspend", SuspendPermit)
            .WithName("SuspendPermit")
            .WithSummary("Suspend a permit")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .RequireAuthorization("Admin");
    }

    private static async Task<IResult> GetPermits(
        [FromServices] IPermitRepository repository,
        [FromQuery] PermitStatus[]? statuses = null,
        [FromQuery] ApplicationType[]? types = null,
        [FromQuery] Guid? operatorId = null,
        [FromQuery] DateTime? issuedFrom = null,
        [FromQuery] DateTime? issuedTo = null,
        [FromQuery] int? expiringWithinDays = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await repository.GetPagedAsync(
            statuses, types, operatorId, issuedFrom, issuedTo,
            expiringWithinDays, search, pageNumber, pageSize, cancellationToken);

        var dtos = items.Select(p => new PermitSummaryDto(
            p.Id,
            p.PermitNumber,
            p.Type,
            p.Status,
            p.OperatorName,
            p.AircraftRegistration,
            p.ValidFrom,
            p.ValidUntil,
            p.IssuedAt)).ToList();

        return Results.Ok(new
        {
            items = dtos,
            totalCount,
            pageNumber,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    private static async Task<IResult> GetPermitById(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetPermitQuery(id), cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound();
    }

    private static async Task<IResult> GetPermitByNumber(
        [FromServices] IMediator mediator,
        string permitNumber,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetPermitByNumberQuery(permitNumber), cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound();
    }

    private static async Task<IResult> VerifyPermit(
        [FromServices] IMediator mediator,
        string permitNumber,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new VerifyPermitQuery(permitNumber), cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem("Error verifying permit", statusCode: 500);
    }

    private static async Task<IResult> RevokePermit(
        [FromServices] IPermitRepository repository,
        [FromServices] IUnitOfWork unitOfWork,
        Guid id,
        [FromBody] RevokePermitRequest request,
        CancellationToken cancellationToken = default)
    {
        var permit = await repository.GetByIdAsync(id, cancellationToken);
        if (permit is null)
        {
            return Results.NotFound();
        }

        try
        {
            permit.Revoke(request.Reason);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Results.NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }

    private static async Task<IResult> SuspendPermit(
        [FromServices] IPermitRepository repository,
        [FromServices] IUnitOfWork unitOfWork,
        Guid id,
        [FromBody] SuspendPermitRequest request,
        CancellationToken cancellationToken = default)
    {
        var permit = await repository.GetByIdAsync(id, cancellationToken);
        if (permit is null)
        {
            return Results.NotFound();
        }

        try
        {
            permit.Suspend(request.Reason, request.SuspendUntil);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Results.NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }
}

public sealed record RevokePermitRequest(string Reason);
public sealed record SuspendPermitRequest(string Reason, DateOnly? SuspendUntil);
