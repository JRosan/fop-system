using FopSystem.Application.Applications.Commands;
using FopSystem.Application.Applications.Queries;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class ApplicationEndpoints
{
    public static void MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/applications")
            .WithTags("Applications")
            .WithOpenApi();

        group.MapGet("/", GetApplications)
            .WithName("GetApplications")
            .WithSummary("Get paginated list of applications")
            .Produces<PagedResult<ApplicationSummaryDto>>();

        group.MapGet("/{id:guid}", GetApplication)
            .WithName("GetApplication")
            .WithSummary("Get application by ID")
            .Produces<ApplicationDto>()
            .Produces(404);

        group.MapPost("/", CreateApplication)
            .WithName("CreateApplication")
            .WithSummary("Create a new FOP application")
            .Produces<ApplicationDto>(201)
            .Produces<ProblemDetails>(400);

        group.MapPost("/{id:guid}/submit", SubmitApplication)
            .WithName("SubmitApplication")
            .WithSummary("Submit an application for review")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .Produces(404);

        group.MapPost("/{id:guid}/review", StartReview)
            .WithName("StartReview")
            .WithSummary("Start reviewing an application")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .Produces(404)
            .AllowAnonymous(); // TODO: Add .RequireAuthorization("Reviewer") when auth is configured

        group.MapPost("/{id:guid}/approve", ApproveApplication)
            .WithName("ApproveApplication")
            .WithSummary("Approve an application and issue permit")
            .Produces<Guid>()
            .Produces<ProblemDetails>(400)
            .Produces(404)
            .AllowAnonymous(); // TODO: Add .RequireAuthorization("Approver") when auth is configured

        group.MapPost("/{id:guid}/reject", RejectApplication)
            .WithName("RejectApplication")
            .WithSummary("Reject an application")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .Produces(404)
            .AllowAnonymous(); // TODO: Add .RequireAuthorization("Reviewer") when auth is configured

        group.MapPost("/{id:guid}/flag", FlagApplication)
            .WithName("FlagApplication")
            .WithSummary("Flag an application for special review")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .Produces(404)
            .AllowAnonymous(); // TODO: Add .RequireAuthorization("Reviewer") when auth is configured

        group.MapPost("/{id:guid}/unflag", UnflagApplication)
            .WithName("UnflagApplication")
            .WithSummary("Remove flag from an application")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .Produces(404)
            .AllowAnonymous(); // TODO: Add .RequireAuthorization("Approver") when auth is configured
    }

    private static async Task<IResult> GetApplications(
        [FromServices] IMediator mediator,
        [FromQuery] ApplicationStatus[]? statuses = null,
        [FromQuery] ApplicationType[]? types = null,
        [FromQuery] Guid? operatorId = null,
        [FromQuery] DateTime? submittedFrom = null,
        [FromQuery] DateTime? submittedTo = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isFlagged = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetApplicationsQuery(
            statuses, types, operatorId, submittedFrom, submittedTo, search, pageNumber, pageSize, isFlagged);

        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 500);
    }

    private static async Task<IResult> GetApplication(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetApplicationQuery(id), cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound();
    }

    private static async Task<IResult> CreateApplication(
        [FromServices] IMediator mediator,
        [FromBody] CreateApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new CreateApplicationCommand(
            request.Type,
            request.OperatorId,
            request.AircraftId,
            request.FlightPurpose,
            request.FlightPurposeDescription,
            request.ArrivalAirport,
            request.DepartureAirport,
            request.EstimatedFlightDate,
            request.NumberOfPassengers,
            request.CargoDescription,
            request.RequestedStartDate,
            request.RequestedEndDate);

        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.Created($"/api/applications/{result.Value.Id}", result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> SubmitApplication(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new SubmitApplicationCommand(id), cancellationToken);

        return result.IsSuccess
            ? Results.NoContent()
            : result.Error?.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> StartReview(
        [FromServices] IMediator mediator,
        HttpContext httpContext,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var userId = httpContext.User.Identity?.Name ?? "system";
        var command = new StartReviewCommand(id, userId);
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.NoContent()
            : result.Error?.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> ApproveApplication(
        [FromServices] IMediator mediator,
        HttpContext httpContext,
        Guid id,
        [FromBody] ApproveApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = httpContext.User.Identity?.Name ?? "system";
        var command = new ApproveApplicationCommand(id, userId, request.Notes);
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : result.Error?.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> RejectApplication(
        [FromServices] IMediator mediator,
        HttpContext httpContext,
        Guid id,
        [FromBody] RejectApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = httpContext.User.Identity?.Name ?? "system";
        var command = new RejectApplicationCommand(id, userId, request.Reason);
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.NoContent()
            : result.Error?.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> FlagApplication(
        [FromServices] IMediator mediator,
        HttpContext httpContext,
        Guid id,
        [FromBody] FlagApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = httpContext.User.Identity?.Name ?? "system";
        var command = new FlagApplicationCommand(id, request.Reason, userId);
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.NoContent()
            : result.Error?.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> UnflagApplication(
        [FromServices] IMediator mediator,
        HttpContext httpContext,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var userId = httpContext.User.Identity?.Name ?? "system";
        var command = new UnflagApplicationCommand(id, userId);
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.NoContent()
            : result.Error?.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
    }
}

public sealed record CreateApplicationRequest(
    ApplicationType Type,
    Guid OperatorId,
    Guid AircraftId,
    FlightPurpose FlightPurpose,
    string? FlightPurposeDescription,
    string ArrivalAirport,
    string DepartureAirport,
    DateOnly EstimatedFlightDate,
    int? NumberOfPassengers,
    string? CargoDescription,
    DateOnly RequestedStartDate,
    DateOnly RequestedEndDate);

public sealed record ApproveApplicationRequest(string? Notes);
public sealed record RejectApplicationRequest(string Reason);
public sealed record FlagApplicationRequest(string Reason);
public sealed record UnflagApplicationRequest();
