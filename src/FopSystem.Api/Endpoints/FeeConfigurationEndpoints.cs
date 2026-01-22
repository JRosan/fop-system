using FopSystem.Application.FeeConfiguration.Commands;
using FopSystem.Application.FeeConfiguration.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class FeeConfigurationEndpoints
{
    public static void MapFeeConfigurationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/fee-configurations")
            .WithTags("Fee Configuration")
            .WithOpenApi();

        group.MapGet("/active", GetActiveConfiguration)
            .WithName("GetActiveFeeConfiguration")
            .WithSummary("Get the current active fee configuration")
            .Produces<FeeConfigurationDto>()
            .Produces(404);

        group.MapGet("/", GetConfigurations)
            .WithName("GetFeeConfigurations")
            .WithSummary("Get paginated list of fee configurations")
            .RequireAuthorization("Admin");

        group.MapPost("/", CreateConfiguration)
            .WithName("CreateFeeConfiguration")
            .WithSummary("Create a new fee configuration")
            .Produces<FeeConfigurationDto>(201)
            .Produces<ProblemDetails>(400)
            .RequireAuthorization("Admin");

        group.MapPut("/{id:guid}", UpdateConfiguration)
            .WithName("UpdateFeeConfiguration")
            .WithSummary("Update a fee configuration")
            .Produces<FeeConfigurationDto>()
            .Produces<ProblemDetails>(400)
            .Produces(404)
            .RequireAuthorization("Admin");
    }

    private static async Task<IResult> GetActiveConfiguration(
        [FromServices] IMediator mediator,
        CancellationToken cancellationToken = default)
    {
        var query = new GetActiveFeeConfigurationQuery();
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return result.Error!.Code == "FeeConfiguration.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetConfigurations(
        [FromServices] IMediator mediator,
        [FromQuery] bool? isActive = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetFeeConfigurationsQuery(isActive, pageNumber, pageSize);
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> CreateConfiguration(
        [FromServices] IMediator mediator,
        [FromBody] CreateFeeConfigurationRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new CreateFeeConfigurationCommand(
            request.BaseFeeUsd,
            request.PerSeatFeeUsd,
            request.PerKgFeeUsd,
            request.OneTimeMultiplier,
            request.BlanketMultiplier,
            request.EmergencyMultiplier,
            request.ModifiedBy,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.Notes);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Created($"/api/fee-configurations/{result.Value!.Id}", result.Value);
    }

    private static async Task<IResult> UpdateConfiguration(
        [FromServices] IMediator mediator,
        Guid id,
        [FromBody] UpdateFeeConfigurationRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new UpdateFeeConfigurationCommand(
            id,
            request.BaseFeeUsd,
            request.PerSeatFeeUsd,
            request.PerKgFeeUsd,
            request.OneTimeMultiplier,
            request.BlanketMultiplier,
            request.EmergencyMultiplier,
            request.ModifiedBy,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.Notes);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return result.Error!.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }
}

public sealed record CreateFeeConfigurationRequest(
    decimal BaseFeeUsd,
    decimal PerSeatFeeUsd,
    decimal PerKgFeeUsd,
    decimal OneTimeMultiplier,
    decimal BlanketMultiplier,
    decimal EmergencyMultiplier,
    string ModifiedBy,
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null,
    string? Notes = null);

public sealed record UpdateFeeConfigurationRequest(
    decimal? BaseFeeUsd = null,
    decimal? PerSeatFeeUsd = null,
    decimal? PerKgFeeUsd = null,
    decimal? OneTimeMultiplier = null,
    decimal? BlanketMultiplier = null,
    decimal? EmergencyMultiplier = null,
    string? ModifiedBy = null,
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null,
    string? Notes = null);
