using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Application;

public sealed class FlightDetails : ValueObject
{
    public FlightPurpose Purpose { get; }
    public string? PurposeDescription { get; }
    public string ArrivalAirport { get; }
    public string DepartureAirport { get; }
    public DateOnly EstimatedFlightDate { get; }
    public int? NumberOfPassengers { get; }
    public string? CargoDescription { get; }

    private FlightDetails(
        FlightPurpose purpose,
        string arrivalAirport,
        string departureAirport,
        DateOnly estimatedFlightDate,
        string? purposeDescription,
        int? numberOfPassengers,
        string? cargoDescription)
    {
        Purpose = purpose;
        PurposeDescription = purposeDescription;
        ArrivalAirport = arrivalAirport;
        DepartureAirport = departureAirport;
        EstimatedFlightDate = estimatedFlightDate;
        NumberOfPassengers = numberOfPassengers;
        CargoDescription = cargoDescription;
    }

    public static FlightDetails Create(
        FlightPurpose purpose,
        string arrivalAirport,
        string departureAirport,
        DateOnly estimatedFlightDate,
        string? purposeDescription = null,
        int? numberOfPassengers = null,
        string? cargoDescription = null)
    {
        if (string.IsNullOrWhiteSpace(arrivalAirport))
            throw new ArgumentException("Arrival airport is required", nameof(arrivalAirport));
        if (string.IsNullOrWhiteSpace(departureAirport))
            throw new ArgumentException("Departure airport is required", nameof(departureAirport));
        if (purpose == FlightPurpose.Other && string.IsNullOrWhiteSpace(purposeDescription))
            throw new ArgumentException("Purpose description is required for 'Other' purpose", nameof(purposeDescription));
        if (numberOfPassengers.HasValue && numberOfPassengers < 0)
            throw new ArgumentException("Number of passengers cannot be negative", nameof(numberOfPassengers));

        return new FlightDetails(
            purpose,
            arrivalAirport.Trim().ToUpperInvariant(),
            departureAirport.Trim().ToUpperInvariant(),
            estimatedFlightDate,
            purposeDescription?.Trim(),
            numberOfPassengers,
            cargoDescription?.Trim());
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Purpose;
        yield return PurposeDescription;
        yield return ArrivalAirport;
        yield return DepartureAirport;
        yield return EstimatedFlightDate;
        yield return NumberOfPassengers;
        yield return CargoDescription;
    }
}
