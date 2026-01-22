using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Aircraft;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class AircraftEndpoints
{
    public static void MapAircraftEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/aircraft")
            .WithTags("Aircraft")
            .WithOpenApi();

        group.MapGet("/", GetAircraft)
            .WithName("GetAircraft")
            .WithSummary("Get paginated list of aircraft");

        group.MapGet("/{id:guid}", GetAircraftById)
            .WithName("GetAircraftById")
            .WithSummary("Get aircraft by ID")
            .Produces<AircraftDto>()
            .Produces(404);

        group.MapGet("/operator/{operatorId:guid}", GetAircraftByOperator)
            .WithName("GetAircraftByOperator")
            .WithSummary("Get all aircraft for an operator");

        group.MapPost("/", CreateAircraft)
            .WithName("CreateAircraft")
            .WithSummary("Create a new aircraft")
            .Produces<AircraftDto>(201)
            .Produces<ProblemDetails>(400);

        group.MapPut("/{id:guid}", UpdateAircraft)
            .WithName("UpdateAircraft")
            .WithSummary("Update an aircraft")
            .Produces<AircraftDto>()
            .Produces<ProblemDetails>(400)
            .Produces(404);
    }

    private static async Task<IResult> GetAircraft(
        [FromServices] IAircraftRepository repository,
        [FromQuery] Guid? operatorId = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await repository.GetPagedAsync(
            operatorId, search, pageNumber, pageSize, cancellationToken);

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

    private static async Task<IResult> GetAircraftById(
        [FromServices] IAircraftRepository repository,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var aircraft = await repository.GetByIdAsync(id, cancellationToken);
        if (aircraft is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(MapToDto(aircraft));
    }

    private static async Task<IResult> GetAircraftByOperator(
        [FromServices] IAircraftRepository repository,
        Guid operatorId,
        CancellationToken cancellationToken = default)
    {
        var aircraft = await repository.GetByOperatorIdAsync(operatorId, cancellationToken);
        var dtos = aircraft.Select(MapToDto).ToList();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> CreateAircraft(
        [FromServices] IAircraftRepository repository,
        [FromServices] IUnitOfWork unitOfWork,
        [FromBody] CreateAircraftRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (await repository.ExistsAsync(request.RegistrationMark, cancellationToken))
            {
                return Results.Problem("Aircraft with this registration mark already exists", statusCode: 409);
            }

            var mtow = Weight.Create(request.MtowValue, request.MtowUnit);

            var aircraft = Aircraft.Create(
                request.RegistrationMark,
                request.Manufacturer,
                request.Model,
                request.SerialNumber,
                request.Category,
                mtow,
                request.SeatCount,
                request.YearOfManufacture,
                request.OperatorId,
                request.NoiseCategory);

            await repository.AddAsync(aircraft, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return Results.Created($"/api/aircraft/{aircraft.Id}", MapToDto(aircraft));
        }
        catch (ArgumentException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }

    private static async Task<IResult> UpdateAircraft(
        [FromServices] IAircraftRepository repository,
        [FromServices] IUnitOfWork unitOfWork,
        Guid id,
        [FromBody] UpdateAircraftRequest request,
        CancellationToken cancellationToken = default)
    {
        var aircraft = await repository.GetByIdAsync(id, cancellationToken);
        if (aircraft is null)
        {
            return Results.NotFound();
        }

        try
        {
            Weight? mtow = null;
            if (request.MtowValue.HasValue && request.MtowUnit.HasValue)
            {
                mtow = Weight.Create(request.MtowValue.Value, request.MtowUnit.Value);
            }

            aircraft.Update(
                request.RegistrationMark,
                mtow,
                request.SeatCount,
                request.NoiseCategory);

            await unitOfWork.SaveChangesAsync(cancellationToken);

            return Results.Ok(MapToDto(aircraft));
        }
        catch (ArgumentException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }

    private static AircraftDto MapToDto(Aircraft a) => new(
        a.Id,
        a.RegistrationMark,
        a.Manufacturer,
        a.Model,
        a.SerialNumber,
        a.Category,
        new WeightDto(a.Mtow.Value, a.Mtow.Unit.ToString()),
        a.SeatCount,
        a.YearOfManufacture,
        a.NoiseCategory,
        a.OperatorId,
        a.CreatedAt,
        a.UpdatedAt);
}

public sealed record CreateAircraftRequest(
    string RegistrationMark,
    string Manufacturer,
    string Model,
    string SerialNumber,
    AircraftCategory Category,
    decimal MtowValue,
    WeightUnit MtowUnit,
    int SeatCount,
    int YearOfManufacture,
    Guid OperatorId,
    string? NoiseCategory);

public sealed record UpdateAircraftRequest(
    string? RegistrationMark,
    decimal? MtowValue,
    WeightUnit? MtowUnit,
    int? SeatCount,
    string? NoiseCategory);
