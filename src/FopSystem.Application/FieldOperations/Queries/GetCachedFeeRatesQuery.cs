using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;

namespace FopSystem.Application.FieldOperations.Queries;

public sealed record GetCachedFeeRatesQuery() : IQuery<IReadOnlyList<CachedFeeRateDto>>;

public sealed class GetCachedFeeRatesQueryHandler : IQueryHandler<GetCachedFeeRatesQuery, IReadOnlyList<CachedFeeRateDto>>
{
    public Task<Result<IReadOnlyList<CachedFeeRateDto>>> Handle(
        GetCachedFeeRatesQuery request,
        CancellationToken cancellationToken)
    {
        // Return hardcoded rates for airport services
        // These can be cached on the mobile device for offline fee calculation
        var rates = new List<CachedFeeRateDto>
        {
            new(AirportServiceType.SewerageDumping, 300m, false, null, "Sewerage disposal service - $300 flat fee"),
            new(AirportServiceType.FireTruckStandby, 25m, true, "services", "Fire truck standby - $25 per service"),
            new(AirportServiceType.FuelFlow, 0.20m, true, "gallons", "Fuel flow charge - $0.20 per gallon"),
            new(AirportServiceType.GroundHandling, 150m, true, "services", "Ground handling - $150 per service"),
            new(AirportServiceType.AircraftTowing, 100m, true, "services", "Aircraft towing - $100 per service"),
            new(AirportServiceType.WaterService, 50m, true, "services", "Potable water service - $50 per service"),
            new(AirportServiceType.GpuService, 75m, true, "hours", "Ground power unit - $75 per hour"),
            new(AirportServiceType.DeIcing, 500m, true, "services", "De-icing service - $500 per service"),
            new(AirportServiceType.BaggageHandling, 25m, true, "bags", "Baggage handling - $25 per bag"),
            new(AirportServiceType.PassengerStairs, 50m, true, "services", "Passenger stairs - $50 per use"),
            new(AirportServiceType.LavatoryService, 100m, true, "services", "Lavatory service - $100 per service"),
            new(AirportServiceType.CateringAccess, 25m, true, "services", "Catering vehicle access - $25 per access")
        };

        return Task.FromResult(Result.Success<IReadOnlyList<CachedFeeRateDto>>(rates));
    }
}
