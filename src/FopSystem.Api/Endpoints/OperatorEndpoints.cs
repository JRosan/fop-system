using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class OperatorEndpoints
{
    public static void MapOperatorEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/operators")
            .WithTags("Operators")
            .WithOpenApi();

        group.MapGet("/", GetOperators)
            .WithName("GetOperators")
            .WithSummary("Get paginated list of operators");

        group.MapGet("/{id:guid}", GetOperator)
            .WithName("GetOperator")
            .WithSummary("Get operator by ID")
            .Produces<OperatorDto>()
            .Produces(404);

        group.MapPost("/", CreateOperator)
            .WithName("CreateOperator")
            .WithSummary("Create a new operator")
            .Produces<OperatorDto>(201)
            .Produces<ProblemDetails>(400);

        group.MapPut("/{id:guid}", UpdateOperator)
            .WithName("UpdateOperator")
            .WithSummary("Update an operator")
            .Produces<OperatorDto>()
            .Produces<ProblemDetails>(400)
            .Produces(404);
    }

    private static async Task<IResult> GetOperators(
        [FromServices] IOperatorRepository repository,
        [FromQuery] string? country = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await repository.GetPagedAsync(
            country, search, pageNumber, pageSize, cancellationToken);

        var dtos = items.Select(MapToDto).ToList();

        return Results.Ok(new
        {
            items = dtos,
            totalCount,
            pageNumber,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    private static async Task<IResult> GetOperator(
        [FromServices] IOperatorRepository repository,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var @operator = await repository.GetByIdAsync(id, cancellationToken);
        if (@operator is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(MapToDto(@operator));
    }

    private static async Task<IResult> CreateOperator(
        [FromServices] IOperatorRepository repository,
        [FromServices] IUnitOfWork unitOfWork,
        [FromBody] CreateOperatorRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (await repository.ExistsAsync(request.RegistrationNumber, cancellationToken))
            {
                return Results.Problem("Operator with this registration number already exists", statusCode: 409);
            }

            var address = Address.Create(
                request.Address.Street,
                request.Address.City,
                request.Address.Country,
                request.Address.State,
                request.Address.PostalCode);

            var contactInfo = ContactInfo.Create(
                request.ContactInfo.Email,
                request.ContactInfo.Phone,
                request.ContactInfo.Fax);

            var authRep = AuthorizedRepresentative.Create(
                request.AuthorizedRepresentative.Name,
                request.AuthorizedRepresentative.Title,
                request.AuthorizedRepresentative.Email,
                request.AuthorizedRepresentative.Phone);

            var @operator = Operator.Create(
                request.Name,
                request.RegistrationNumber,
                request.Country,
                address,
                contactInfo,
                authRep,
                request.AocNumber,
                request.AocIssuingAuthority,
                request.AocExpiryDate,
                request.TradingName);

            await repository.AddAsync(@operator, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return Results.Created($"/api/operators/{@operator.Id}", MapToDto(@operator));
        }
        catch (ArgumentException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }

    private static async Task<IResult> UpdateOperator(
        [FromServices] IOperatorRepository repository,
        [FromServices] IUnitOfWork unitOfWork,
        Guid id,
        [FromBody] UpdateOperatorRequest request,
        CancellationToken cancellationToken = default)
    {
        var @operator = await repository.GetByIdAsync(id, cancellationToken);
        if (@operator is null)
        {
            return Results.NotFound();
        }

        try
        {
            Address? address = null;
            if (request.Address is not null)
            {
                address = Address.Create(
                    request.Address.Street,
                    request.Address.City,
                    request.Address.Country,
                    request.Address.State,
                    request.Address.PostalCode);
            }

            ContactInfo? contactInfo = null;
            if (request.ContactInfo is not null)
            {
                contactInfo = ContactInfo.Create(
                    request.ContactInfo.Email,
                    request.ContactInfo.Phone,
                    request.ContactInfo.Fax);
            }

            AuthorizedRepresentative? authRep = null;
            if (request.AuthorizedRepresentative is not null)
            {
                authRep = AuthorizedRepresentative.Create(
                    request.AuthorizedRepresentative.Name,
                    request.AuthorizedRepresentative.Title,
                    request.AuthorizedRepresentative.Email,
                    request.AuthorizedRepresentative.Phone);
            }

            @operator.Update(
                request.Name,
                request.TradingName,
                address,
                contactInfo,
                authRep,
                request.AocNumber,
                request.AocIssuingAuthority,
                request.AocExpiryDate);

            await unitOfWork.SaveChangesAsync(cancellationToken);

            return Results.Ok(MapToDto(@operator));
        }
        catch (ArgumentException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }

    private static OperatorDto MapToDto(Operator o) => new(
        o.Id,
        o.Name,
        o.TradingName,
        o.RegistrationNumber,
        o.Country,
        new AddressDto(o.Address.Street, o.Address.City, o.Address.State, o.Address.PostalCode, o.Address.Country),
        new ContactInfoDto(o.ContactInfo.Email, o.ContactInfo.Phone, o.ContactInfo.Fax),
        new AuthorizedRepresentativeDto(o.AuthorizedRepresentative.Name, o.AuthorizedRepresentative.Title,
            o.AuthorizedRepresentative.Email, o.AuthorizedRepresentative.Phone),
        o.AocNumber,
        o.AocIssuingAuthority,
        o.AocExpiryDate,
        o.CreatedAt,
        o.UpdatedAt);
}

public sealed record CreateOperatorRequest(
    string Name,
    string? TradingName,
    string RegistrationNumber,
    string Country,
    AddressDto Address,
    ContactInfoDto ContactInfo,
    AuthorizedRepresentativeDto AuthorizedRepresentative,
    string AocNumber,
    string AocIssuingAuthority,
    DateOnly AocExpiryDate);

public sealed record UpdateOperatorRequest(
    string? Name,
    string? TradingName,
    AddressDto? Address,
    ContactInfoDto? ContactInfo,
    AuthorizedRepresentativeDto? AuthorizedRepresentative,
    string? AocNumber,
    string? AocIssuingAuthority,
    DateOnly? AocExpiryDate);
