using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Field;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.FieldOperations.Commands;

public sealed record LogAirportServiceCommand(
    Guid? PermitId,
    string? PermitNumber,
    Guid OperatorId,
    string? AircraftRegistration,
    Guid OfficerId,
    string OfficerName,
    AirportServiceType ServiceType,
    decimal Quantity,
    string? QuantityUnit,
    BviAirport Airport,
    double? Latitude,
    double? Longitude,
    double? Accuracy,
    string? Notes,
    bool WasOfflineLog = false,
    string? DeviceId = null) : ICommand<AirportServiceLogDto>;

public sealed class LogAirportServiceCommandValidator : AbstractValidator<LogAirportServiceCommand>
{
    public LogAirportServiceCommandValidator()
    {
        RuleFor(x => x.OperatorId).NotEmpty();
        RuleFor(x => x.OfficerId).NotEmpty();
        RuleFor(x => x.OfficerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.QuantityUnit).MaximumLength(50);
        RuleFor(x => x.Notes).MaximumLength(1000);
        RuleFor(x => x.DeviceId).MaximumLength(100);
        RuleFor(x => x.AircraftRegistration).MaximumLength(20);
        RuleFor(x => x.PermitNumber).MaximumLength(50);

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .When(x => x.Longitude.HasValue);
    }
}

public sealed class LogAirportServiceCommandHandler : ICommandHandler<LogAirportServiceCommand, AirportServiceLogDto>
{
    private readonly IAirportServiceLogRepository _serviceLogRepository;
    private readonly IBviaFeeRateRepository _feeRateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LogAirportServiceCommandHandler(
        IAirportServiceLogRepository serviceLogRepository,
        IBviaFeeRateRepository feeRateRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceLogRepository = serviceLogRepository;
        _feeRateRepository = feeRateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AirportServiceLogDto>> Handle(
        LogAirportServiceCommand request,
        CancellationToken cancellationToken)
    {
        // Get the fee rate for this service type
        var unitRate = GetServiceRate(request.ServiceType);
        var quantityUnit = GetQuantityUnit(request.ServiceType);

        // Create location if coordinates provided
        GeoCoordinate? location = null;
        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            location = GeoCoordinate.Create(
                request.Latitude.Value,
                request.Longitude.Value,
                accuracy: request.Accuracy);
        }

        var serviceLog = AirportServiceLog.Create(
            operatorId: request.OperatorId,
            officerId: request.OfficerId,
            officerName: request.OfficerName,
            serviceType: request.ServiceType,
            quantity: request.Quantity,
            quantityUnit: request.QuantityUnit ?? quantityUnit,
            unitRate: unitRate,
            airport: request.Airport,
            permitId: request.PermitId,
            permitNumber: request.PermitNumber,
            aircraftRegistration: request.AircraftRegistration,
            location: location,
            deviceId: request.DeviceId,
            notes: request.Notes,
            wasOfflineLog: request.WasOfflineLog);

        await _serviceLogRepository.AddAsync(serviceLog, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(MapToDto(serviceLog));
    }

    private static Money GetServiceRate(AirportServiceType serviceType) => serviceType switch
    {
        AirportServiceType.SewerageDumping => Money.Usd(300m),      // $300 flat
        AirportServiceType.FireTruckStandby => Money.Usd(25m),     // $25 per service
        AirportServiceType.FuelFlow => Money.Usd(0.20m),           // $0.20 per gallon
        AirportServiceType.GroundHandling => Money.Usd(150m),      // $150 per service
        AirportServiceType.AircraftTowing => Money.Usd(100m),      // $100 per service
        AirportServiceType.WaterService => Money.Usd(50m),         // $50 per service
        AirportServiceType.GpuService => Money.Usd(75m),           // $75 per hour
        AirportServiceType.DeIcing => Money.Usd(500m),             // $500 per service
        AirportServiceType.BaggageHandling => Money.Usd(25m),      // $25 per bag
        AirportServiceType.PassengerStairs => Money.Usd(50m),      // $50 per use
        AirportServiceType.LavatoryService => Money.Usd(100m),     // $100 per service
        AirportServiceType.CateringAccess => Money.Usd(25m),       // $25 per access
        _ => Money.Usd(0m)
    };

    private static string GetQuantityUnit(AirportServiceType serviceType) => serviceType switch
    {
        AirportServiceType.FuelFlow => "gallons",
        AirportServiceType.GpuService => "hours",
        AirportServiceType.BaggageHandling => "bags",
        _ => "services"
    };

    private static AirportServiceLogDto MapToDto(AirportServiceLog log) => new(
        Id: log.Id,
        LogNumber: log.LogNumber,
        PermitId: log.PermitId,
        PermitNumber: log.PermitNumber,
        OperatorId: log.OperatorId,
        AircraftRegistration: log.AircraftRegistration,
        OfficerId: log.OfficerId,
        OfficerName: log.OfficerName,
        ServiceType: log.ServiceType,
        ServiceDescription: log.ServiceDescription,
        FeeAmount: new MoneyDto(log.FeeAmount.Amount, log.FeeAmount.Currency.ToString()),
        Quantity: log.Quantity,
        QuantityUnit: log.QuantityUnit,
        UnitRate: new MoneyDto(log.UnitRate.Amount, log.UnitRate.Currency.ToString()),
        Location: log.Location != null
            ? new GeoCoordinateDto(log.Location.Latitude, log.Location.Longitude, log.Location.Altitude, log.Location.Accuracy)
            : null,
        Airport: log.Airport,
        LoggedAt: log.LoggedAt,
        Notes: log.Notes,
        Status: log.Status,
        InvoiceId: log.InvoiceId,
        InvoiceNumber: log.InvoiceNumber,
        InvoicedAt: log.InvoicedAt,
        WasOfflineLog: log.WasOfflineLog,
        SyncedAt: log.SyncedAt);
}
