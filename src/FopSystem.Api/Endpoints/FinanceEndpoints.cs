using FopSystem.Application.Payments.Commands;
using FopSystem.Application.Reports.Queries;
using FopSystem.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class FinanceEndpoints
{
    public static void MapFinanceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/finance")
            .WithTags("Finance")
            .WithOpenApi()
            .RequireAuthorization("FinanceOfficer");

        group.MapPost("/refund", RefundPayment)
            .WithName("RefundPayment")
            .WithSummary("Process a payment refund")
            .Produces<RefundResultDto>()
            .Produces<ProblemDetails>(400)
            .Produces(404);

        group.MapGet("/reports/financial", GetFinancialReport)
            .WithName("GetFinancialReport")
            .WithSummary("Get financial report with revenue and refund data")
            .Produces<FinancialReportDto>()
            .Produces<ProblemDetails>(400);

        group.MapGet("/reports/revenue-summary", GetRevenueSummary)
            .WithName("GetRevenueSummary")
            .WithSummary("Get revenue summary by date range")
            .Produces<FinancialSummaryDto>()
            .Produces<ProblemDetails>(400);
    }

    private static async Task<IResult> RefundPayment(
        [FromServices] IMediator mediator,
        [FromBody] RefundPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new RefundPaymentCommand(
            request.ApplicationId,
            request.RefundedBy,
            request.Reason);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Ok(result.Value);
        }

        return result.Error?.Code switch
        {
            "Error.NotFound" => Results.NotFound(),
            "Payment.NotFound" => Results.NotFound(new { message = result.Error.Message }),
            _ => Results.Problem(result.Error!.Message, statusCode: 400)
        };
    }

    private static async Task<IResult> GetFinancialReport(
        [FromServices] IMediator mediator,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] ApplicationType? type = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetFinancialReportQuery(fromDate, toDate, type);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetRevenueSummary(
        [FromServices] IMediator mediator,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetFinancialReportQuery(fromDate, toDate);
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Ok(result.Value.Summary);
        }

        return Results.Problem(result.Error!.Message, statusCode: 400);
    }
}

public sealed record RefundPaymentRequest(
    Guid ApplicationId,
    string RefundedBy,
    string Reason);
