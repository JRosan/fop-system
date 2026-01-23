using FopSystem.Application.DTOs;
using FopSystem.Application.Subscriptions.Commands;
using FopSystem.Application.Subscriptions.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class SubscriptionEndpoints
{
    public static void MapSubscriptionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/subscriptions")
            .WithTags("Subscriptions")
            .WithOpenApi();

        // Get all subscription plans
        group.MapGet("/plans", async (
            IMediator mediator,
            CancellationToken cancellationToken,
            [FromQuery] bool includeInactive = false) =>
        {
            var plans = await mediator.Send(new GetSubscriptionPlansQuery(includeInactive), cancellationToken);
            return Results.Ok(plans);
        })
        .WithName("GetSubscriptionPlans")
        .WithSummary("Get all subscription plans")
        .WithDescription("Returns all available subscription plans. Set includeInactive=true to include deactivated plans.")
        .Produces<IReadOnlyList<SubscriptionPlanDto>>();

        // Get tenant's current subscription
        group.MapGet("/tenants/{tenantId:guid}", async (
            Guid tenantId,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var subscription = await mediator.Send(new GetTenantSubscriptionQuery(tenantId), cancellationToken);
            return subscription is null
                ? Results.NotFound($"Tenant {tenantId} not found.")
                : Results.Ok(subscription);
        })
        .WithName("GetTenantSubscription")
        .WithSummary("Get tenant subscription details")
        .WithDescription("Returns the current subscription details for a specific tenant.")
        .Produces<TenantSubscriptionDto>()
        .Produces(StatusCodes.Status404NotFound);

        // Update tenant subscription
        group.MapPut("/tenants/{tenantId:guid}", async (
            Guid tenantId,
            UpdateSubscriptionRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var subscription = await mediator.Send(
                    new UpdateTenantSubscriptionCommand(tenantId, request.Tier, request.IsAnnualBilling),
                    cancellationToken);
                return Results.Ok(subscription);
            }
            catch (InvalidOperationException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        })
        .WithName("UpdateTenantSubscription")
        .WithSummary("Update tenant subscription")
        .WithDescription("Changes the subscription tier and billing cycle for a tenant.")
        .Produces<TenantSubscriptionDto>()
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);

        // Start trial for tenant
        group.MapPost("/tenants/{tenantId:guid}/trial", async (
            Guid tenantId,
            StartTrialRequest? request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var subscription = await mediator.Send(
                    new StartTenantTrialCommand(tenantId, request?.TrialDays ?? 30),
                    cancellationToken);
                return Results.Ok(subscription);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        })
        .WithName("StartTenantTrial")
        .WithSummary("Start trial for tenant")
        .WithDescription("Starts a trial period for a tenant. Default is 30 days.")
        .Produces<TenantSubscriptionDto>()
        .Produces(StatusCodes.Status400BadRequest);
    }
}
