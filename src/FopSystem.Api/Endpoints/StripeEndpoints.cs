using FopSystem.Application.Payments.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class StripeEndpoints
{
    public static void MapStripeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/stripe")
            .WithTags("Stripe Payments")
            .WithOpenApi();

        // Create checkout session
        group.MapPost("/checkout-session", async (
            CreateCheckoutSessionRequest request,
            IMediator mediator,
            HttpContext httpContext,
            CancellationToken cancellationToken) =>
        {
            // Build success/cancel URLs based on request origin
            var origin = httpContext.Request.Headers.Origin.FirstOrDefault()
                ?? $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";

            var successUrl = request.SuccessUrl ?? $"{origin}/subscription?success=true";
            var cancelUrl = request.CancelUrl ?? $"{origin}/subscription?canceled=true";

            try
            {
                var result = await mediator.Send(new CreateStripeCheckoutSessionCommand(
                    request.TenantId,
                    request.PlanId,
                    request.IsAnnual,
                    successUrl,
                    cancelUrl,
                    request.CustomerEmail), cancellationToken);

                return Results.Ok(new CreateCheckoutSessionResponse(
                    result.SessionId,
                    result.SessionUrl));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("CreateStripeCheckoutSession")
        .WithSummary("Create Stripe Checkout session")
        .WithDescription("Creates a Stripe Checkout session for subscription payment. Returns session ID and URL for redirect.")
        .Produces<CreateCheckoutSessionResponse>()
        .Produces(StatusCodes.Status400BadRequest);

        // Create billing portal session
        group.MapPost("/portal-session", async (
            CreatePortalSessionRequest request,
            [FromServices] FopSystem.Application.Interfaces.IStripeService stripeService,
            HttpContext httpContext,
            CancellationToken cancellationToken) =>
        {
            var origin = httpContext.Request.Headers.Origin.FirstOrDefault()
                ?? $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";

            var returnUrl = request.ReturnUrl ?? $"{origin}/subscription";

            try
            {
                var portalUrl = await stripeService.CreatePortalSessionAsync(
                    request.StripeCustomerId,
                    returnUrl,
                    cancellationToken);

                return Results.Ok(new CreatePortalSessionResponse(portalUrl));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("CreateStripePortalSession")
        .WithSummary("Create Stripe Billing Portal session")
        .WithDescription("Creates a Stripe Billing Portal session for subscription management. Returns portal URL for redirect.")
        .Produces<CreatePortalSessionResponse>()
        .Produces(StatusCodes.Status400BadRequest);

        // Webhook endpoint
        group.MapPost("/webhook", async (
            HttpContext httpContext,
            IMediator mediator,
            ILogger<Program> logger,
            CancellationToken cancellationToken) =>
        {
            // Read the raw request body
            using var reader = new StreamReader(httpContext.Request.Body);
            var payload = await reader.ReadToEndAsync(cancellationToken);

            // Get the Stripe signature header
            var signature = httpContext.Request.Headers["Stripe-Signature"].FirstOrDefault();

            if (string.IsNullOrEmpty(signature))
            {
                logger.LogWarning("Stripe webhook received without signature header");
                return Results.BadRequest(new { message = "Missing Stripe-Signature header" });
            }

            var result = await mediator.Send(new HandleStripeWebhookCommand(payload, signature), cancellationToken);

            if (result.Success)
            {
                return Results.Ok(new { received = true, message = result.Message });
            }

            logger.LogWarning("Stripe webhook processing failed: {Message}", result.Message);
            return Results.BadRequest(new { message = result.Message });
        })
        .WithName("HandleStripeWebhook")
        .WithSummary("Handle Stripe webhook events")
        .WithDescription("Endpoint for Stripe to send webhook events. Handles checkout.session.completed, invoice.paid, customer.subscription.updated, etc.")
        .DisableAntiforgery() // Webhooks don't have CSRF tokens
        .Produces<object>()
        .Produces(StatusCodes.Status400BadRequest);

        // Get Stripe publishable key (for frontend)
        group.MapGet("/config", (
            [FromServices] Microsoft.Extensions.Options.IOptions<FopSystem.Infrastructure.Services.StripeSettings> settings) =>
        {
            return Results.Ok(new StripeConfigResponse(
                settings.Value.PublishableKey,
                settings.Value.Enabled));
        })
        .WithName("GetStripeConfig")
        .WithSummary("Get Stripe configuration")
        .WithDescription("Returns the Stripe publishable key and enabled status for frontend integration.")
        .Produces<StripeConfigResponse>();
    }
}

// Request/Response DTOs
public record CreateCheckoutSessionRequest(
    Guid TenantId,
    Guid PlanId,
    bool IsAnnual,
    string? CustomerEmail = null,
    string? SuccessUrl = null,
    string? CancelUrl = null);

public record CreateCheckoutSessionResponse(
    string SessionId,
    string SessionUrl);

public record CreatePortalSessionRequest(
    string StripeCustomerId,
    string? ReturnUrl = null);

public record CreatePortalSessionResponse(
    string PortalUrl);

public record StripeConfigResponse(
    string PublishableKey,
    bool Enabled);
