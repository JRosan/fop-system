using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Application.FieldOperations.Commands;
using FopSystem.Application.FieldOperations.Queries;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FopSystem.Api.Endpoints;

public static class FieldOperationsEndpoints
{
    public static void MapFieldOperationsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/field")
            .WithTags("Field Operations")
            .WithOpenApi();

        // Permit Verification
        group.MapPost("/verify", VerifyPermit)
            .WithName("VerifyPermit")
            .WithSummary("Verify a permit via QR code scan")
            .Produces<VerifyPermitResponse>()
            .Produces<ProblemDetails>(400);

        group.MapPost("/verify/offline", ValidateOfflineToken)
            .WithName("ValidateOfflineToken")
            .WithSummary("Validate a JWT token for offline verification")
            .Produces<VerifyPermitResponse>()
            .Produces<ProblemDetails>(400);

        group.MapGet("/permits/{permitId:guid}/qr-token", GetPermitQrToken)
            .WithName("GetPermitQrToken")
            .WithSummary("Generate JWT token for permit QR code")
            .Produces<PermitQrTokenDto>()
            .Produces(404);

        group.MapGet("/public-key", GetPublicKey)
            .WithName("GetPermitPublicKey")
            .WithSummary("Get the public key for offline JWT verification")
            .Produces<PublicKeyResponse>();

        // Service Logging
        group.MapPost("/services", LogService)
            .WithName("LogAirportService")
            .WithSummary("Log an airport service")
            .RequireAuthorization("FieldOfficer")
            .Produces<AirportServiceLogDto>(201)
            .Produces<ProblemDetails>(400);

        group.MapGet("/services", GetServiceLogs)
            .WithName("GetServiceLogs")
            .WithSummary("Get service logs for the current officer")
            .RequireAuthorization("FieldOfficer")
            .Produces<PagedResultResponse<AirportServiceLogSummaryDto>>();

        group.MapGet("/services/{id:guid}", GetServiceLog)
            .WithName("GetServiceLog")
            .WithSummary("Get a specific service log")
            .RequireAuthorization("FieldOfficer")
            .Produces<AirportServiceLogDto>()
            .Produces(404);

        // Offline Sync
        group.MapPost("/sync", SyncOfflineData)
            .WithName("SyncOfflineData")
            .WithSummary("Sync offline service logs and verifications")
            .RequireAuthorization("FieldOfficer")
            .Produces<SyncOfflineDataResponse>()
            .Produces<ProblemDetails>(400);

        // Cache endpoints for offline
        group.MapGet("/cache/permits", GetCachedPermits)
            .WithName("GetCachedPermits")
            .WithSummary("Get permits for offline caching")
            .RequireAuthorization("FieldOfficer")
            .Produces<IReadOnlyList<CachedPermitDto>>();

        group.MapGet("/cache/fee-rates", GetCachedFeeRates)
            .WithName("GetCachedFeeRates")
            .WithSummary("Get fee rates for offline calculation")
            .Produces<IReadOnlyList<CachedFeeRateDto>>();

        // Telemetry
        group.MapPost("/telemetry", LogTelemetry)
            .WithName("LogTelemetry")
            .WithSummary("Log a telemetry event from mobile app")
            .Produces(204)
            .Produces<ProblemDetails>(400);
    }

    private static async Task<IResult> VerifyPermit(
        [FromServices] IMediator mediator,
        [FromBody] VerifyPermitRequest request,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId(user);
        var userName = GetUserName(user);

        var command = new VerifyPermitCommand(
            QrContent: request.QrContent,
            OfficerId: userId,
            OfficerName: userName,
            Latitude: request.Latitude,
            Longitude: request.Longitude,
            Accuracy: request.Accuracy,
            Airport: request.Airport,
            DeviceId: request.DeviceId,
            ScanDurationMs: request.ScanDurationMs);

        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> ValidateOfflineToken(
        [FromServices] IJwtPermitTokenService tokenService,
        [FromBody] ValidateTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await tokenService.ValidateTokenAsync(request.Token);

        if (validationResult.IsValid && validationResult.Claims != null)
        {
            return Results.Ok(new VerifyPermitResponse(
                IsValid: true,
                Result: VerificationResult.Valid,
                FailureReason: null,
                PermitDetails: new PermitVerificationDetailsDto(
                    PermitId: validationResult.Claims.PermitId,
                    PermitNumber: validationResult.Claims.PermitNumber,
                    OperatorName: validationResult.Claims.OperatorName,
                    AircraftRegistration: validationResult.Claims.AircraftRegistration,
                    ValidFrom: validationResult.Claims.ValidFrom,
                    ValidUntil: validationResult.Claims.ValidUntil,
                    Status: validationResult.Claims.Status,
                    DaysUntilExpiry: (validationResult.Claims.ValidUntil.DayNumber -
                                      DateOnly.FromDateTime(DateTime.UtcNow).DayNumber))));
        }

        return Results.Ok(new VerifyPermitResponse(
            IsValid: false,
            Result: validationResult.Result,
            FailureReason: validationResult.FailureReason,
            PermitDetails: null));
    }

    private static async Task<IResult> GetPermitQrToken(
        [FromServices] IMediator mediator,
        Guid permitId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPermitQrTokenQuery(permitId);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound();
    }

    private static IResult GetPublicKey([FromServices] IJwtPermitTokenService tokenService)
    {
        var publicKey = tokenService.GetPublicKey();
        return Results.Ok(new PublicKeyResponse(publicKey));
    }

    private static async Task<IResult> LogService(
        [FromServices] IMediator mediator,
        [FromBody] CreateServiceLogRequest request,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId(user);
        var userName = GetUserName(user);

        var command = new LogAirportServiceCommand(
            PermitId: request.PermitId,
            PermitNumber: request.PermitNumber,
            OperatorId: request.OperatorId,
            AircraftRegistration: request.AircraftRegistration,
            OfficerId: userId,
            OfficerName: userName,
            ServiceType: request.ServiceType,
            Quantity: request.Quantity,
            QuantityUnit: request.QuantityUnit,
            Airport: request.Airport,
            Latitude: request.Latitude,
            Longitude: request.Longitude,
            Accuracy: request.Accuracy,
            Notes: request.Notes,
            WasOfflineLog: request.WasOfflineLog,
            DeviceId: request.DeviceId);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Created($"/api/field/services/{result.Value!.Id}", result.Value);
        }

        return Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetServiceLogs(
        [FromServices] IMediator mediator,
        ClaimsPrincipal user,
        [FromQuery] Guid? operatorId = null,
        [FromQuery] BviAirport? airport = null,
        [FromQuery] AirportServiceLogStatus[]? statuses = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var officerId = GetUserId(user);

        var query = new GetServiceLogsQuery(
            OperatorId: operatorId,
            OfficerId: officerId,
            Statuses: statuses,
            Airport: airport,
            FromDate: fromDate,
            ToDate: toDate,
            PageNumber: pageNumber,
            PageSize: pageSize);

        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(new PagedResultResponse<AirportServiceLogSummaryDto>(result.Value!))
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetServiceLog(
        [FromServices] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var query = new GetServiceLogQuery(id);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound();
    }

    private static async Task<IResult> SyncOfflineData(
        [FromServices] IMediator mediator,
        [FromBody] SyncOfflineDataRequest request,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId(user);
        var userName = GetUserName(user);

        var command = new SyncOfflineDataCommand(
            UserId: userId,
            UserName: userName,
            ServiceLogs: request.ServiceLogs,
            Verifications: request.Verifications,
            DeviceId: request.DeviceId);

        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetCachedPermits(
        [FromServices] IMediator mediator,
        [FromQuery] Guid? operatorId = null,
        [FromQuery] int maxResults = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetCachedPermitsQuery(operatorId, null, maxResults);
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetCachedFeeRates(
        [FromServices] IMediator mediator,
        CancellationToken cancellationToken = default)
    {
        var query = new GetCachedFeeRatesQuery();
        var result = await mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> LogTelemetry(
        [FromServices] IMediator mediator,
        [FromBody] LogTelemetryRequest request,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = user.Identity?.IsAuthenticated == true ? GetUserId(user) : (Guid?)null;

        var command = new LogTelemetryCommand(
            EventType: request.EventType,
            UserId: userId,
            Latitude: request.Latitude,
            Longitude: request.Longitude,
            Airport: request.Airport,
            ActionLatencyMs: request.ActionLatencyMs,
            JsonPayload: request.JsonPayload,
            DeviceId: request.DeviceId,
            SessionId: request.SessionId,
            AppVersion: request.AppVersion,
            Platform: request.Platform,
            OsVersion: request.OsVersion,
            NetworkType: request.NetworkType,
            PermitId: request.PermitId,
            ServiceLogId: request.ServiceLogId,
            VerificationLogId: request.VerificationLogId);

        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.NoContent()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static Guid GetUserId(ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? user.FindFirst("sub")?.Value;

        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    private static string GetUserName(ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Name)?.Value
               ?? user.FindFirst("name")?.Value
               ?? "Unknown Officer";
    }
}

// Request DTOs
public sealed record ValidateTokenRequest(string Token);
public sealed record PublicKeyResponse(string PublicKey);
