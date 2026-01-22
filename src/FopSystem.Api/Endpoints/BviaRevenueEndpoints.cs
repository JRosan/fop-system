using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Application.Revenue.Commands;
using FopSystem.Application.Revenue.Queries;
using FopSystem.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class BviaRevenueEndpoints
{
    public static void MapBviaRevenueEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bvia")
            .WithTags("BVIAA Revenue")
            .WithOpenApi();

        // Fee Calculation
        var feeGroup = group.MapGroup("/fees");

        feeGroup.MapPost("/calculate", CalculateBviaFees)
            .WithName("CalculateBviaFees")
            .WithSummary("Calculate BVIAA operational fees for a flight")
            .Produces<BviaFeeCalculationResultDto>()
            .Produces<ProblemDetails>(400);

        feeGroup.MapPost("/calculate-unified", CalculateUnifiedFees)
            .WithName("CalculateUnifiedFees")
            .WithSummary("Calculate both FOP permit and BVIAA operational fees")
            .Produces<UnifiedFeeCalculationResultDto>()
            .Produces<ProblemDetails>(400);

        // Invoices
        var invoiceGroup = group.MapGroup("/invoices");

        invoiceGroup.MapGet("/", GetInvoices)
            .WithName("GetBviaInvoices")
            .WithSummary("List BVIAA invoices with filtering")
            .Produces<PagedResultResponse<BviaInvoiceSummaryDto>>();

        invoiceGroup.MapGet("/{id:guid}", GetInvoice)
            .WithName("GetBviaInvoice")
            .WithSummary("Get a specific BVIAA invoice")
            .Produces<BviaInvoiceDto>()
            .Produces(404);

        invoiceGroup.MapPost("/generate", GenerateInvoice)
            .WithName("GeneratePreArrivalInvoice")
            .WithSummary("Generate a pre-arrival BVIAA invoice")
            .RequireAuthorization("Reviewer")
            .Produces<BviaInvoiceDto>(201)
            .Produces<ProblemDetails>(400);

        invoiceGroup.MapPost("/{id:guid}/finalize", FinalizeInvoice)
            .WithName("FinalizeInvoice")
            .WithSummary("Finalize a draft invoice for payment")
            .RequireAuthorization("Reviewer")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .Produces(404);

        // Payments
        invoiceGroup.MapPost("/{id:guid}/payments", RecordPayment)
            .WithName("RecordBviaPayment")
            .WithSummary("Record a payment against an invoice")
            .RequireAuthorization("Finance")
            .Produces<BviaPaymentDto>(201)
            .Produces<ProblemDetails>(400)
            .Produces(404);

        // Operator Account
        var operatorGroup = group.MapGroup("/operators");

        operatorGroup.MapGet("/{operatorId:guid}/account", GetAccountStatus)
            .WithName("GetOperatorAccountStatus")
            .WithSummary("Get operator's BVIAA account status and balance")
            .Produces<OperatorAccountStatusDto>();

        operatorGroup.MapGet("/{operatorId:guid}/permit-eligibility", CheckPermitEligibility)
            .WithName("CheckPermitEligibility")
            .WithSummary("Check if operator is eligible for permit issuance (no overdue debts)")
            .Produces<PermitIssuanceEligibilityDto>();

        // Rate Management (Admin)
        var rateGroup = group.MapGroup("/rates");

        rateGroup.MapGet("/", GetRates)
            .WithName("GetBviaFeeRates")
            .WithSummary("Get all BVIAA fee rates")
            .RequireAuthorization("Admin")
            .Produces<PagedResultResponse<BviaFeeRateDto>>();

        rateGroup.MapPost("/", CreateRate)
            .WithName("CreateBviaFeeRate")
            .WithSummary("Create a new BVIAA fee rate")
            .RequireAuthorization("Admin")
            .Produces<BviaFeeRateDto>(201)
            .Produces<ProblemDetails>(400);
    }

    private static async Task<IResult> CalculateBviaFees(
        [FromServices] IMediator mediator,
        [FromBody] CalculateBviaFeesRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = new CalculateBviaFeesQuery(
            MtowLbs: request.MtowLbs,
            OperationType: request.OperationType,
            Airport: request.Airport,
            PassengerCount: request.PassengerCount,
            ParkingHours: request.ParkingHours,
            ArrivalTime: request.ArrivalTime,
            DepartureTime: request.DepartureTime,
            RequiresCatViFire: request.RequiresCatViFire,
            IncludeFlightPlanFiling: request.IncludeFlightPlanFiling,
            FuelGallons: request.FuelGallons,
            IsInterisland: request.IsInterisland);

        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> CalculateUnifiedFees(
        [FromServices] IMediator mediator,
        [FromBody] CalculateUnifiedFeesRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = new CalculateUnifiedFeesQuery(
            ApplicationType: request.ApplicationType,
            OperationType: request.OperationType,
            Airport: request.Airport,
            SeatCount: request.SeatCount,
            MtowKg: request.MtowKg,
            PassengerCount: request.PassengerCount,
            ParkingHours: request.ParkingHours,
            ArrivalTime: request.ArrivalTime,
            DepartureTime: request.DepartureTime,
            RequiresCatViFire: request.RequiresCatViFire,
            IncludeFlightPlanFiling: request.IncludeFlightPlanFiling,
            FuelGallons: request.FuelGallons,
            IsInterisland: request.IsInterisland);

        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetInvoices(
        [FromServices] IMediator mediator,
        [FromQuery] Guid? operatorId = null,
        [FromQuery] BviAirport? airport = null,
        [FromQuery] BviaInvoiceStatus[]? statuses = null,
        [FromQuery] DateOnly? invoiceDateFrom = null,
        [FromQuery] DateOnly? invoiceDateTo = null,
        [FromQuery] DateOnly? flightDateFrom = null,
        [FromQuery] DateOnly? flightDateTo = null,
        [FromQuery] bool? isOverdue = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetBviaInvoicesQuery(
            Statuses: statuses,
            OperatorId: operatorId,
            Airport: airport,
            InvoiceDateFrom: invoiceDateFrom,
            InvoiceDateTo: invoiceDateTo,
            FlightDateFrom: flightDateFrom,
            FlightDateTo: flightDateTo,
            IsOverdue: isOverdue,
            Search: search,
            PageNumber: pageNumber,
            PageSize: pageSize);

        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(new PagedResultResponse<BviaInvoiceSummaryDto>(result.Value!))
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetInvoice(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var query = new GetBviaInvoiceQuery(id);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound();
    }

    private static async Task<IResult> GenerateInvoice(
        [FromServices] IMediator mediator,
        [FromBody] GenerateInvoiceRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new GeneratePreArrivalInvoiceCommand(
            OperatorId: request.OperatorId,
            ArrivalAirport: request.ArrivalAirport,
            DepartureAirport: request.DepartureAirport,
            OperationType: request.OperationType,
            FlightDate: request.FlightDate,
            AircraftRegistration: request.AircraftRegistration,
            MtowLbs: request.MtowLbs,
            SeatCount: request.SeatCount,
            PassengerCount: request.PassengerCount,
            FopApplicationId: request.FopApplicationId,
            Notes: request.Notes);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Created($"/api/bvia/invoices/{result.Value!.Id}", result.Value);
        }

        return Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> FinalizeInvoice(
        [FromServices] IMediator mediator,
        Guid id,
        [FromBody] FinalizeInvoiceRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new FinalizeInvoiceCommand(id, request.FinalizedBy);
        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.NoContent();
        }

        return result.Error?.Code == "Error.NotFound"
            ? Results.NotFound()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> RecordPayment(
        [FromServices] IMediator mediator,
        Guid id,
        [FromBody] RecordPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new RecordBviaPaymentCommand(
            InvoiceId: id,
            Amount: request.Amount,
            Method: request.Method,
            TransactionReference: request.TransactionReference,
            Notes: request.Notes,
            RecordedBy: request.RecordedBy);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Created($"/api/bvia/invoices/{id}/payments/{result.Value!.Id}", result.Value);
        }

        return result.Error?.Code == "Error.NotFound"
            ? Results.NotFound()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetAccountStatus(
        [FromServices] IMediator mediator,
        Guid operatorId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetOperatorAccountStatusQuery(operatorId);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> CheckPermitEligibility(
        [FromServices] IMediator mediator,
        Guid operatorId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetOperatorAccountStatusQuery(operatorId);
        var result = await mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            return Results.Problem(result.Error!.Message, statusCode: 400);
        }

        var status = result.Value!;
        var eligibility = new PermitIssuanceEligibilityDto(
            IsEligible: status.IsEligibleForPermitIssuance,
            OutstandingDebt: status.TotalOverdue,
            OverdueInvoiceCount: status.OverdueInvoiceCount,
            BlockReasons: status.HasOverdueDebt
                ? new List<string>
                {
                    $"Outstanding BVIAA debt: {status.TotalOverdue.Amount:C}",
                    $"Overdue invoices: {status.OverdueInvoiceCount}"
                }
                : new List<string>());

        return Results.Ok(eligibility);
    }

    private static async Task<IResult> GetRates(
        [FromServices] IMediator mediator,
        [FromQuery] BviaFeeCategory? category = null,
        [FromQuery] FlightOperationType? operationType = null,
        [FromQuery] BviAirport? airport = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        // For now, return empty list as rate management is an admin feature
        // Could add GetBviaFeeRatesQuery if needed
        return Results.Ok(new PagedResultResponse<BviaFeeRateDto>(
            new PagedResult<BviaFeeRateDto>(
                new List<BviaFeeRateDto>(),
                0,
                pageNumber,
                pageSize)));
    }

    private static async Task<IResult> CreateRate(
        [FromServices] IMediator mediator,
        [FromBody] CreateFeeRateRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new CreateBviaFeeRateCommand(
            Category: request.Category,
            OperationType: request.OperationType,
            RateAmount: request.RateAmount,
            IsPerUnit: request.IsPerUnit,
            UnitDescription: request.UnitDescription,
            EffectiveFrom: request.EffectiveFrom,
            Airport: request.Airport,
            MtowTier: request.MtowTier,
            MinimumFeeAmount: request.MinimumFeeAmount,
            Description: request.Description);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Created($"/api/bvia/rates/{result.Value!.Id}", result.Value);
        }

        return Results.Problem(result.Error!.Message, statusCode: 400);
    }
}

// Request DTOs
public sealed record CalculateBviaFeesRequest(
    decimal MtowLbs,
    FlightOperationType OperationType,
    BviAirport Airport,
    int PassengerCount = 0,
    int ParkingHours = 0,
    TimeOnly? ArrivalTime = null,
    TimeOnly? DepartureTime = null,
    bool RequiresCatViFire = false,
    bool IncludeFlightPlanFiling = false,
    decimal FuelGallons = 0,
    bool IsInterisland = false);

public sealed record CalculateUnifiedFeesRequest(
    ApplicationType ApplicationType,
    FlightOperationType OperationType,
    BviAirport Airport,
    int SeatCount,
    decimal MtowKg,
    int PassengerCount = 0,
    int ParkingHours = 0,
    TimeOnly? ArrivalTime = null,
    TimeOnly? DepartureTime = null,
    bool RequiresCatViFire = false,
    bool IncludeFlightPlanFiling = false,
    decimal FuelGallons = 0,
    bool IsInterisland = false);

public sealed record GenerateInvoiceRequest(
    Guid OperatorId,
    BviAirport ArrivalAirport,
    BviAirport? DepartureAirport,
    FlightOperationType OperationType,
    DateOnly FlightDate,
    string? AircraftRegistration,
    decimal MtowLbs,
    int SeatCount,
    int? PassengerCount = null,
    Guid? FopApplicationId = null,
    string? Notes = null);

public sealed record FinalizeInvoiceRequest(string FinalizedBy);

public sealed record RecordPaymentRequest(
    decimal Amount,
    PaymentMethod Method,
    string? TransactionReference,
    string? Notes,
    string RecordedBy);

public sealed record CreateFeeRateRequest(
    BviaFeeCategory Category,
    FlightOperationType OperationType,
    decimal RateAmount,
    bool IsPerUnit,
    string? UnitDescription,
    DateOnly EffectiveFrom,
    BviAirport? Airport = null,
    Domain.ValueObjects.MtowTierLevel? MtowTier = null,
    decimal? MinimumFeeAmount = null,
    string? Description = null);

public sealed record PagedResultResponse<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages,
    bool HasPreviousPage,
    bool HasNextPage)
{
    public PagedResultResponse(PagedResult<T> pagedResult)
        : this(
            pagedResult.Items,
            pagedResult.TotalCount,
            pagedResult.PageNumber,
            pagedResult.PageSize,
            pagedResult.TotalPages,
            pagedResult.HasPreviousPage,
            pagedResult.HasNextPage)
    {
    }
}
