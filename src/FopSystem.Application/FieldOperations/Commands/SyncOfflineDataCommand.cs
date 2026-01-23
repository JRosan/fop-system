using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Field;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.FieldOperations.Commands;

public sealed record SyncOfflineDataCommand(
    Guid UserId,
    string UserName,
    List<OfflineServiceLogCommand> ServiceLogs,
    List<OfflineVerificationCommand> Verifications,
    string DeviceId) : ICommand<SyncOfflineDataResponse>;

public sealed class SyncOfflineDataCommandValidator : AbstractValidator<SyncOfflineDataCommand>
{
    public SyncOfflineDataCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DeviceId).NotEmpty().MaximumLength(100);
    }
}

public sealed class SyncOfflineDataCommandHandler : ICommandHandler<SyncOfflineDataCommand, SyncOfflineDataResponse>
{
    private readonly IAirportServiceLogRepository _serviceLogRepository;
    private readonly IFieldVerificationLogRepository _verificationLogRepository;
    private readonly IBviaFeeRateRepository _feeRateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SyncOfflineDataCommandHandler(
        IAirportServiceLogRepository serviceLogRepository,
        IFieldVerificationLogRepository verificationLogRepository,
        IBviaFeeRateRepository feeRateRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceLogRepository = serviceLogRepository;
        _verificationLogRepository = verificationLogRepository;
        _feeRateRepository = feeRateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SyncOfflineDataResponse>> Handle(
        SyncOfflineDataCommand request,
        CancellationToken cancellationToken)
    {
        var errors = new List<string>();
        var serviceLogsSynced = 0;
        var verificationsSynced = 0;

        // Sync service logs
        foreach (var offlineLog in request.ServiceLogs)
        {
            try
            {
                var unitRate = GetServiceRate(offlineLog.ServiceType);
                var quantityUnit = GetQuantityUnit(offlineLog.ServiceType);

                GeoCoordinate? location = null;
                if (offlineLog.Latitude.HasValue && offlineLog.Longitude.HasValue)
                {
                    location = GeoCoordinate.Create(
                        offlineLog.Latitude.Value,
                        offlineLog.Longitude.Value);
                }

                var serviceLog = AirportServiceLog.Create(
                    operatorId: offlineLog.OperatorId,
                    officerId: request.UserId,
                    officerName: request.UserName,
                    serviceType: offlineLog.ServiceType,
                    quantity: offlineLog.Quantity,
                    quantityUnit: offlineLog.QuantityUnit ?? quantityUnit,
                    unitRate: unitRate,
                    airport: offlineLog.Airport,
                    permitId: offlineLog.PermitId,
                    permitNumber: offlineLog.PermitNumber,
                    aircraftRegistration: offlineLog.AircraftRegistration,
                    location: location,
                    deviceId: request.DeviceId,
                    notes: offlineLog.Notes,
                    wasOfflineLog: true);

                serviceLog.MarkSynced();

                await _serviceLogRepository.AddAsync(serviceLog, cancellationToken);
                serviceLogsSynced++;
            }
            catch (Exception ex)
            {
                errors.Add($"ServiceLog {offlineLog.OfflineId}: {ex.Message}");
            }
        }

        // Sync verification logs
        foreach (var offlineVerification in request.Verifications)
        {
            try
            {
                GeoCoordinate? location = null;
                if (offlineVerification.Latitude.HasValue && offlineVerification.Longitude.HasValue)
                {
                    location = GeoCoordinate.Create(
                        offlineVerification.Latitude.Value,
                        offlineVerification.Longitude.Value);
                }

                var verificationLog = FieldVerificationLog.RecordVerification(
                    scannedPermitNumber: offlineVerification.QrContent,
                    officerId: request.UserId,
                    officerName: request.UserName,
                    result: offlineVerification.Result,
                    scanDurationMs: offlineVerification.ScanDurationMs,
                    location: location,
                    airport: offlineVerification.Airport,
                    deviceId: request.DeviceId,
                    failureReason: offlineVerification.FailureReason,
                    rawQrContent: offlineVerification.QrContent,
                    wasOfflineVerification: true);

                verificationLog.MarkSynced();

                await _verificationLogRepository.AddAsync(verificationLog, cancellationToken);
                verificationsSynced++;
            }
            catch (Exception ex)
            {
                errors.Add($"Verification {offlineVerification.OfflineId}: {ex.Message}");
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new SyncOfflineDataResponse(
            ServiceLogsSynced: serviceLogsSynced,
            VerificationsSynced: verificationsSynced,
            Errors: errors,
            SyncedAt: DateTime.UtcNow));
    }

    private static Money GetServiceRate(AirportServiceType serviceType) => serviceType switch
    {
        AirportServiceType.SewerageDumping => Money.Usd(300m),
        AirportServiceType.FireTruckStandby => Money.Usd(25m),
        AirportServiceType.FuelFlow => Money.Usd(0.20m),
        AirportServiceType.GroundHandling => Money.Usd(150m),
        AirportServiceType.AircraftTowing => Money.Usd(100m),
        AirportServiceType.WaterService => Money.Usd(50m),
        AirportServiceType.GpuService => Money.Usd(75m),
        AirportServiceType.DeIcing => Money.Usd(500m),
        AirportServiceType.BaggageHandling => Money.Usd(25m),
        AirportServiceType.PassengerStairs => Money.Usd(50m),
        AirportServiceType.LavatoryService => Money.Usd(100m),
        AirportServiceType.CateringAccess => Money.Usd(25m),
        _ => Money.Usd(0m)
    };

    private static string GetQuantityUnit(AirportServiceType serviceType) => serviceType switch
    {
        AirportServiceType.FuelFlow => "gallons",
        AirportServiceType.GpuService => "hours",
        AirportServiceType.BaggageHandling => "bags",
        _ => "services"
    };
}
