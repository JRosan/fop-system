using FopSystem.Application.Waivers.Commands;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class WaiverEndpoints
{
    public static void MapWaiverEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/waivers")
            .WithTags("Waivers")
            .WithOpenApi();

        group.MapPost("/request", RequestWaiver)
            .WithName("RequestWaiver")
            .WithSummary("Request a fee waiver for an application")
            .Produces<WaiverDto>(201)
            .Produces<ProblemDetails>(400)
            .Produces(404);

        group.MapPost("/{waiverId:guid}/approve", ApproveWaiver)
            .WithName("ApproveWaiver")
            .WithSummary("Approve a fee waiver (requires approver role)")
            .RequireAuthorization("Approver")
            .Produces<WaiverApprovalResultDto>()
            .Produces<ProblemDetails>(400)
            .Produces(404);

        group.MapPost("/{waiverId:guid}/reject", RejectWaiver)
            .WithName("RejectWaiver")
            .WithSummary("Reject a fee waiver (requires approver role)")
            .RequireAuthorization("Approver")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .Produces(404);

        group.MapGet("/application/{applicationId:guid}", GetWaiversByApplication)
            .WithName("GetWaiversByApplication")
            .WithSummary("Get all waivers for an application")
            .Produces<IReadOnlyList<WaiverDto>>()
            .Produces(404);

        group.MapGet("/pending", GetPendingWaivers)
            .WithName("GetPendingWaivers")
            .WithSummary("Get all pending waiver requests (requires reviewer role)")
            .RequireAuthorization("Reviewer")
            .Produces<IReadOnlyList<PendingWaiverDto>>();
    }

    private static async Task<IResult> RequestWaiver(
        [FromServices] IMediator mediator,
        [FromBody] RequestWaiverRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new RequestWaiverCommand(
            request.ApplicationId,
            request.WaiverType,
            request.Reason,
            request.RequestedBy);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Created($"/api/waivers/{result.Value.Id}", result.Value);
        }

        return result.Error?.Code == "Error.NotFound"
            ? Results.NotFound()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> ApproveWaiver(
        [FromServices] IMediator mediator,
        Guid waiverId,
        [FromBody] ApproveWaiverRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new ApproveWaiverCommand(
            request.ApplicationId,
            waiverId,
            request.ApprovedBy,
            request.WaiverPercentage);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Ok(result.Value);
        }

        return result.Error?.Code == "Error.NotFound"
            ? Results.NotFound()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> RejectWaiver(
        [FromServices] IMediator mediator,
        Guid waiverId,
        [FromBody] RejectWaiverRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new RejectWaiverCommand(
            request.ApplicationId,
            waiverId,
            request.RejectedBy,
            request.Reason);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.NoContent();
        }

        return result.Error?.Code == "Error.NotFound"
            ? Results.NotFound()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetWaiversByApplication(
        [FromServices] IApplicationRepository applicationRepository,
        Guid applicationId,
        CancellationToken cancellationToken = default)
    {
        var application = await applicationRepository.GetByIdAsync(applicationId, cancellationToken);
        if (application is null)
        {
            return Results.NotFound();
        }

        var waivers = application.Waivers.Select(MapToDto).ToList();
        return Results.Ok(waivers);
    }

    private static async Task<IResult> GetPendingWaivers(
        [FromServices] IApplicationRepository applicationRepository,
        [FromServices] IOperatorRepository operatorRepository,
        CancellationToken cancellationToken = default)
    {
        // Get all applications that have pending waivers
        var (applications, _) = await applicationRepository.GetPagedAsync(
            statuses: null,
            types: null,
            operatorId: null,
            submittedFrom: null,
            submittedTo: null,
            search: null,
            pageNumber: 1,
            pageSize: 1000,
            cancellationToken: cancellationToken);

        var pendingWaivers = new List<PendingWaiverDto>();

        foreach (var app in applications)
        {
            var pendingWaiver = app.GetPendingWaiver();
            if (pendingWaiver is not null)
            {
                var @operator = await operatorRepository.GetByIdAsync(app.OperatorId, cancellationToken);
                pendingWaivers.Add(new PendingWaiverDto(
                    pendingWaiver.Id,
                    app.Id,
                    app.ApplicationNumber,
                    @operator?.Name ?? "Unknown",
                    pendingWaiver.Type.ToString(),
                    pendingWaiver.Reason,
                    pendingWaiver.RequestedBy,
                    pendingWaiver.RequestedAt,
                    app.CalculatedFee.Amount,
                    app.CalculatedFee.Currency.ToString()));
            }
        }

        return Results.Ok(pendingWaivers.OrderByDescending(w => w.RequestedAt).ToList());
    }

    private static WaiverDto MapToDto(FeeWaiver waiver) => new(
        waiver.Id,
        waiver.ApplicationId,
        waiver.Type.ToString(),
        waiver.Status.ToString(),
        waiver.Reason,
        waiver.RequestedBy,
        waiver.RequestedAt,
        waiver.WaivedAmount is not null
            ? new Application.DTOs.MoneyDto(waiver.WaivedAmount.Amount, waiver.WaivedAmount.Currency.ToString())
            : null,
        waiver.WaiverPercentage,
        waiver.ApprovedBy,
        waiver.ApprovedAt,
        waiver.RejectedBy,
        waiver.RejectedAt,
        waiver.RejectionReason);
}

public sealed record RequestWaiverRequest(
    Guid ApplicationId,
    WaiverType WaiverType,
    string Reason,
    string RequestedBy);

public sealed record ApproveWaiverRequest(
    Guid ApplicationId,
    string ApprovedBy,
    decimal WaiverPercentage);

public sealed record RejectWaiverRequest(
    Guid ApplicationId,
    string RejectedBy,
    string Reason);

public sealed record PendingWaiverDto(
    Guid WaiverId,
    Guid ApplicationId,
    string ApplicationNumber,
    string OperatorName,
    string WaiverType,
    string Reason,
    string RequestedBy,
    DateTime RequestedAt,
    decimal CurrentFeeAmount,
    string Currency);
