using FopSystem.Application.Tenants;
using FopSystem.Application.Tenants.Commands;
using FopSystem.Application.Tenants.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class TenantEndpoints
{
    public static void MapTenantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tenants")
            .WithTags("Tenants")
            .WithOpenApi();

        // Get current tenant (from context) - available to all authenticated users
        group.MapGet("/current", async ([FromServices] IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCurrentTenantQuery());

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error!.Message });
        })
        .WithName("GetCurrentTenant")
        .WithSummary("Get the current tenant based on the request context")
        .Produces<TenantDto>()
        .Produces(404);

        // Resolve tenant by subdomain - public endpoint for initial load
        group.MapGet("/resolve/{subdomain}", async (
            string subdomain,
            [FromServices] IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTenantBySubdomainQuery(subdomain));

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error!.Message });
        })
        .WithName("ResolveTenantBySubdomain")
        .WithSummary("Resolve tenant by subdomain (public endpoint)")
        .Produces<TenantBrandingDto>()
        .Produces(404);

        // List all tenants - SuperAdmin only
        group.MapGet("/", async (
            [FromQuery] bool activeOnly,
            [FromServices] IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTenantsQuery(activeOnly));

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error!.Message });
        })
        .WithName("GetTenants")
        .WithSummary("List all tenants (SuperAdmin only)")
        .Produces<IReadOnlyList<TenantSummaryDto>>()
        .Produces(400);
        // Note: In production, add .RequireAuthorization("SuperAdmin")

        // Get tenant by ID - SuperAdmin only
        group.MapGet("/{id:guid}", async (
            Guid id,
            [FromServices] IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTenantQuery(id));

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error!.Message });
        })
        .WithName("GetTenant")
        .WithSummary("Get tenant by ID (SuperAdmin only)")
        .Produces<TenantDto>()
        .Produces(404);
        // Note: In production, add .RequireAuthorization("SuperAdmin")

        // Create new tenant - SuperAdmin only
        group.MapPost("/", async (
            [FromBody] CreateTenantRequest request,
            [FromServices] IMediator mediator) =>
        {
            var command = new CreateTenantCommand(
                request.Code,
                request.Name,
                request.Subdomain,
                request.ContactEmail,
                request.LogoUrl,
                request.PrimaryColor,
                request.SecondaryColor,
                request.ContactPhone,
                request.TimeZone,
                request.Currency);

            var result = await mediator.Send(command);

            return result.IsSuccess
                ? Results.Created($"/api/tenants/{result.Value.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error!.Message });
        })
        .WithName("CreateTenant")
        .WithSummary("Create a new tenant (SuperAdmin only)")
        .Produces<TenantDto>(201)
        .Produces(400);
        // Note: In production, add .RequireAuthorization("SuperAdmin")

        // Update tenant - SuperAdmin only
        group.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateTenantRequest request,
            [FromServices] IMediator mediator) =>
        {
            var command = new UpdateTenantCommand(
                id,
                request.Name,
                request.Subdomain,
                request.LogoUrl,
                request.PrimaryColor,
                request.SecondaryColor,
                request.ContactEmail,
                request.ContactPhone,
                request.TimeZone,
                request.Currency);

            var result = await mediator.Send(command);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.Code == "Tenant.NotFound"
                    ? Results.NotFound(new { error = result.Error.Message })
                    : Results.BadRequest(new { error = result.Error.Message });
        })
        .WithName("UpdateTenant")
        .WithSummary("Update tenant settings (SuperAdmin only)")
        .Produces<TenantDto>()
        .Produces(400)
        .Produces(404);
        // Note: In production, add .RequireAuthorization("SuperAdmin")
    }
}

public record CreateTenantRequest(
    string Code,
    string Name,
    string Subdomain,
    string ContactEmail,
    string? LogoUrl = null,
    string? PrimaryColor = null,
    string? SecondaryColor = null,
    string? ContactPhone = null,
    string? TimeZone = null,
    string? Currency = null);

public record UpdateTenantRequest(
    string? Name = null,
    string? Subdomain = null,
    string? LogoUrl = null,
    string? PrimaryColor = null,
    string? SecondaryColor = null,
    string? ContactEmail = null,
    string? ContactPhone = null,
    string? TimeZone = null,
    string? Currency = null);
