using FopSystem.Application.Applications.Queries;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class FeeEndpoints
{
    public static void MapFeeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/fees")
            .WithTags("Fees")
            .WithOpenApi();

        group.MapGet("/calculate", CalculateFee)
            .WithName("CalculateFee")
            .WithSummary("Calculate the fee for an FOP application")
            .Produces<FeeCalculationResultDto>()
            .Produces<ProblemDetails>(400);

        group.MapPost("/calculate", CalculateFeePost)
            .WithName("CalculateFeePost")
            .WithSummary("Calculate the fee for an FOP application")
            .Produces<FeeCalculationResultDto>()
            .Produces<ProblemDetails>(400);
    }

    private static async Task<IResult> CalculateFee(
        [FromServices] IMediator mediator,
        [FromQuery] ApplicationType type,
        [FromQuery] int seatCount,
        [FromQuery] decimal mtowKg,
        CancellationToken cancellationToken = default)
    {
        var query = new CalculateFeeQuery(type, seatCount, mtowKg);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> CalculateFeePost(
        [FromServices] IMediator mediator,
        [FromBody] CalculateFeeRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = new CalculateFeeQuery(request.Type, request.SeatCount, request.MtowKg);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }
}

public sealed record CalculateFeeRequest(
    ApplicationType Type,
    int SeatCount,
    decimal MtowKg);
