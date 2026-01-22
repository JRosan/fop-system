using FopSystem.Application.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/dashboard")
            .WithTags("Dashboard")
            .WithOpenApi()
            .RequireAuthorization();

        group.MapGet("/applicant/{operatorId:guid}", GetApplicantDashboard)
            .WithName("GetApplicantDashboard")
            .WithSummary("Get dashboard data for an applicant (by operator)")
            .Produces<ApplicantDashboardDto>()
            .RequireAuthorization("Applicant");

        group.MapGet("/reviewer", GetReviewerDashboard)
            .WithName("GetReviewerDashboard")
            .WithSummary("Get dashboard data for reviewers")
            .Produces<ReviewerDashboardDto>()
            .RequireAuthorization("Reviewer");

        group.MapGet("/finance", GetFinanceDashboard)
            .WithName("GetFinanceDashboard")
            .WithSummary("Get dashboard data for finance officers")
            .Produces<FinanceDashboardDto>()
            .RequireAuthorization("FinanceOfficer");

        group.MapGet("/admin", GetAdminDashboard)
            .WithName("GetAdminDashboard")
            .WithSummary("Get dashboard data for administrators")
            .Produces<AdminDashboardDto>()
            .RequireAuthorization("Admin");
    }

    private static async Task<IResult> GetApplicantDashboard(
        [FromServices] IMediator mediator,
        Guid operatorId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetApplicantDashboardQuery(operatorId);
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetReviewerDashboard(
        [FromServices] IMediator mediator,
        CancellationToken cancellationToken = default)
    {
        var query = new GetReviewerDashboardQuery();
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetFinanceDashboard(
        [FromServices] IMediator mediator,
        CancellationToken cancellationToken = default)
    {
        var query = new GetFinanceDashboardQuery();
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetAdminDashboard(
        [FromServices] IMediator mediator,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAdminDashboardQuery();
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }
}
