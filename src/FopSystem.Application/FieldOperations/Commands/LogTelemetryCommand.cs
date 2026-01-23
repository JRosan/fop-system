using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.FieldOperations.Commands;

public sealed record LogTelemetryCommand(
    TelemetryEventType EventType,
    Guid? UserId,
    double? Latitude,
    double? Longitude,
    BviAirport? Airport,
    int? ActionLatencyMs,
    string? JsonPayload,
    string? DeviceId,
    string? SessionId,
    string? AppVersion,
    string? Platform,
    string? OsVersion,
    string? NetworkType,
    Guid? PermitId,
    Guid? ServiceLogId,
    Guid? VerificationLogId) : ICommand;

public sealed class LogTelemetryCommandValidator : AbstractValidator<LogTelemetryCommand>
{
    public LogTelemetryCommandValidator()
    {
        RuleFor(x => x.DeviceId).MaximumLength(100);
        RuleFor(x => x.SessionId).MaximumLength(100);
        RuleFor(x => x.AppVersion).MaximumLength(50);
        RuleFor(x => x.Platform).MaximumLength(50);
        RuleFor(x => x.OsVersion).MaximumLength(50);
        RuleFor(x => x.NetworkType).MaximumLength(50);
        RuleFor(x => x.JsonPayload).MaximumLength(10000);

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .When(x => x.Longitude.HasValue);

        RuleFor(x => x.ActionLatencyMs)
            .GreaterThanOrEqualTo(0)
            .When(x => x.ActionLatencyMs.HasValue);
    }
}

public sealed class LogTelemetryCommandHandler : ICommandHandler<LogTelemetryCommand>
{
    private readonly ITelemetryEventRepository _telemetryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LogTelemetryCommandHandler(
        ITelemetryEventRepository telemetryRepository,
        IUnitOfWork unitOfWork)
    {
        _telemetryRepository = telemetryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(LogTelemetryCommand request, CancellationToken cancellationToken)
    {
        GeoCoordinate? location = null;
        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            location = GeoCoordinate.Create(
                request.Latitude.Value,
                request.Longitude.Value);
        }

        var telemetryEvent = TelemetryEvent.Create(
            eventType: request.EventType,
            userId: request.UserId,
            deviceId: request.DeviceId,
            sessionId: request.SessionId,
            location: location,
            airport: request.Airport,
            actionLatencyMs: request.ActionLatencyMs,
            jsonPayload: request.JsonPayload,
            appVersion: request.AppVersion,
            platform: request.Platform,
            osVersion: request.OsVersion,
            networkType: request.NetworkType,
            permitId: request.PermitId,
            serviceLogId: request.ServiceLogId,
            verificationLogId: request.VerificationLogId);

        await _telemetryRepository.AddAsync(telemetryEvent, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
