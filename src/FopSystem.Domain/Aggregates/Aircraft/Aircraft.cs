using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Aircraft;

public class Aircraft : Entity<Guid>
{
    public string RegistrationMark { get; private set; } = default!;
    public string Manufacturer { get; private set; } = default!;
    public string Model { get; private set; } = default!;
    public string SerialNumber { get; private set; } = default!;
    public AircraftCategory Category { get; private set; }
    public Weight Mtow { get; private set; } = default!;
    public int SeatCount { get; private set; }
    public int YearOfManufacture { get; private set; }
    public string? NoiseCategory { get; private set; }
    public Guid OperatorId { get; private set; }

    private Aircraft() { }

    public static Aircraft Create(
        string registrationMark,
        string manufacturer,
        string model,
        string serialNumber,
        AircraftCategory category,
        Weight mtow,
        int seatCount,
        int yearOfManufacture,
        Guid operatorId,
        string? noiseCategory = null)
    {
        if (string.IsNullOrWhiteSpace(registrationMark))
            throw new ArgumentException("Registration mark is required", nameof(registrationMark));
        if (string.IsNullOrWhiteSpace(manufacturer))
            throw new ArgumentException("Manufacturer is required", nameof(manufacturer));
        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Model is required", nameof(model));
        if (string.IsNullOrWhiteSpace(serialNumber))
            throw new ArgumentException("Serial number is required", nameof(serialNumber));
        if (seatCount < 0)
            throw new ArgumentException("Seat count cannot be negative", nameof(seatCount));
        if (yearOfManufacture < 1900 || yearOfManufacture > DateTime.UtcNow.Year + 1)
            throw new ArgumentException("Invalid year of manufacture", nameof(yearOfManufacture));
        if (operatorId == Guid.Empty)
            throw new ArgumentException("Operator ID is required", nameof(operatorId));

        return new Aircraft
        {
            Id = Guid.NewGuid(),
            RegistrationMark = registrationMark.Trim().ToUpperInvariant(),
            Manufacturer = manufacturer.Trim(),
            Model = model.Trim(),
            SerialNumber = serialNumber.Trim(),
            Category = category,
            Mtow = mtow,
            SeatCount = seatCount,
            YearOfManufacture = yearOfManufacture,
            OperatorId = operatorId,
            NoiseCategory = noiseCategory?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        string? registrationMark = null,
        Weight? mtow = null,
        int? seatCount = null,
        string? noiseCategory = null)
    {
        if (registrationMark is not null)
            RegistrationMark = registrationMark.Trim().ToUpperInvariant();
        if (mtow is not null)
            Mtow = mtow;
        if (seatCount is not null)
        {
            if (seatCount < 0)
                throw new ArgumentException("Seat count cannot be negative", nameof(seatCount));
            SeatCount = seatCount.Value;
        }
        NoiseCategory = noiseCategory?.Trim();
        SetUpdatedAt();
    }

    public decimal MtowInKilograms => Mtow.InKilograms;
}
