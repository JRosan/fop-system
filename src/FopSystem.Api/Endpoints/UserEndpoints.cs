using FopSystem.Application.Users.Commands;
using FopSystem.Application.Users.Queries;
using FopSystem.Domain.Aggregates.User;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .WithTags("Users")
            .WithOpenApi()
            .RequireAuthorization("Admin");

        group.MapGet("/", GetUsers)
            .WithName("GetUsers")
            .WithSummary("Get paginated list of users");

        group.MapGet("/{id:guid}", GetUser)
            .WithName("GetUser")
            .WithSummary("Get user by ID")
            .Produces<UserDto>()
            .Produces(404);

        group.MapPost("/", CreateUser)
            .WithName("CreateUser")
            .WithSummary("Create a new user")
            .Produces<UserDto>(201)
            .Produces<ProblemDetails>(400);

        group.MapPut("/{id:guid}", UpdateUser)
            .WithName("UpdateUser")
            .WithSummary("Update a user")
            .Produces<UserDto>()
            .Produces<ProblemDetails>(400)
            .Produces(404);

        group.MapPost("/{id:guid}/activate", ActivateUser)
            .WithName("ActivateUser")
            .WithSummary("Activate a user")
            .Produces(204)
            .Produces(404);

        group.MapPost("/{id:guid}/deactivate", DeactivateUser)
            .WithName("DeactivateUser")
            .WithSummary("Deactivate a user")
            .Produces(204)
            .Produces(404);

        group.MapGet("/by-role/{role}", GetUsersByRole)
            .WithName("GetUsersByRole")
            .WithSummary("Get users by role");
    }

    private static async Task<IResult> GetUsers(
        [FromServices] IMediator mediator,
        [FromQuery] UserRole[]? roles = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetUsersQuery(roles, isActive, search, pageNumber, pageSize);
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetUser(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var query = new GetUserQuery(id);
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return result.Error!.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> CreateUser(
        [FromServices] IMediator mediator,
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new CreateUserCommand(
            request.Email,
            request.FirstName,
            request.LastName,
            request.Role,
            request.Phone,
            request.AzureAdObjectId);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Created($"/api/users/{result.Value!.Id}", result.Value);
    }

    private static async Task<IResult> UpdateUser(
        [FromServices] IMediator mediator,
        Guid id,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new UpdateUserCommand(
            id,
            request.FirstName,
            request.LastName,
            request.Phone,
            request.Role);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return result.Error!.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> ActivateUser(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var command = new ActivateUserCommand(id);
        var result = await mediator.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return result.Error!.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.NoContent();
    }

    private static async Task<IResult> DeactivateUser(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var command = new DeactivateUserCommand(id);
        var result = await mediator.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return result.Error!.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.NoContent();
    }

    private static async Task<IResult> GetUsersByRole(
        [FromServices] IMediator mediator,
        UserRole role,
        CancellationToken cancellationToken = default)
    {
        var query = new GetUsersQuery(Roles: [role], IsActive: true);
        var result = await mediator.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        return Results.Ok(result.Value!.Items);
    }
}

public sealed record CreateUserRequest(
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    string? Phone = null,
    string? AzureAdObjectId = null);

public sealed record UpdateUserRequest(
    string? FirstName = null,
    string? LastName = null,
    string? Phone = null,
    UserRole? Role = null);
