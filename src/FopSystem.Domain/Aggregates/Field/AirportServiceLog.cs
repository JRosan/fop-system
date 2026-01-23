using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Field;

/// <summary>
/// Represents a logged airport service performed for an aircraft.
/// Used by field officers to record services that will be invoiced.
/// </summary>
public class AirportServiceLog : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string LogNumber { get; private set; } = default!;

    public Guid? PermitId { get; private set; }
    public string? PermitNumber { get; private set; }
    public Guid OperatorId { get; private set; }
    public string? AircraftRegistration { get; private set; }

    public Guid OfficerId { get; private set; }
    public string OfficerName { get; private set; } = default!;
    public string? DeviceId { get; private set; }

    public AirportServiceType ServiceType { get; private set; }
    public string ServiceDescription { get; private set; } = default!;

    public Money FeeAmount { get; private set; } = default!;
    public decimal Quantity { get; private set; }
    public string? QuantityUnit { get; private set; }
    public Money UnitRate { get; private set; } = default!;

    public GeoCoordinate? Location { get; private set; }
    public BviAirport Airport { get; private set; }

    public DateTime LoggedAt { get; private set; }
    public string? Notes { get; private set; }

    public AirportServiceLogStatus Status { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public string? InvoiceNumber { get; private set; }
    public DateTime? InvoicedAt { get; private set; }

    public bool WasOfflineLog { get; private set; }
    public DateTime? SyncedAt { get; private set; }

    public string? CancellationReason { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancelledBy { get; private set; }

    private AirportServiceLog() { }

    public static AirportServiceLog Create(
        Guid operatorId,
        Guid officerId,
        string officerName,
        AirportServiceType serviceType,
        decimal quantity,
        string? quantityUnit,
        Money unitRate,
        BviAirport airport,
        Guid? permitId = null,
        string? permitNumber = null,
        string? aircraftRegistration = null,
        GeoCoordinate? location = null,
        string? deviceId = null,
        string? notes = null,
        bool wasOfflineLog = false)
    {
        if (operatorId == Guid.Empty)
            throw new ArgumentException("Operator ID is required", nameof(operatorId));
        if (officerId == Guid.Empty)
            throw new ArgumentException("Officer ID is required", nameof(officerId));
        if (string.IsNullOrWhiteSpace(officerName))
            throw new ArgumentException("Officer name is required", nameof(officerName));
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        var feeAmount = unitRate.Multiply(quantity);
        var description = GetServiceDescription(serviceType);

        var log = new AirportServiceLog
        {
            Id = Guid.NewGuid(),
            LogNumber = GenerateLogNumber(airport),
            OperatorId = operatorId,
            PermitId = permitId,
            PermitNumber = permitNumber,
            AircraftRegistration = aircraftRegistration,
            OfficerId = officerId,
            OfficerName = officerName,
            DeviceId = deviceId,
            ServiceType = serviceType,
            ServiceDescription = description,
            Quantity = quantity,
            QuantityUnit = quantityUnit,
            UnitRate = unitRate,
            FeeAmount = feeAmount,
            Airport = airport,
            Location = location,
            LoggedAt = DateTime.UtcNow,
            Notes = notes,
            Status = wasOfflineLog ? AirportServiceLogStatus.PendingSync : AirportServiceLogStatus.Pending,
            WasOfflineLog = wasOfflineLog,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        log.RaiseDomainEvent(new AirportServiceLoggedEvent(
            log.Id,
            log.LogNumber,
            permitId,
            serviceType,
            feeAmount,
            officerId,
            location));

        return log;
    }

    private static string GenerateLogNumber(BviAirport airport)
    {
        var airportCode = airport switch
        {
            BviAirport.TUPJ => "EIS",  // TB Lettsome (Beef Island)
            BviAirport.TUPW => "VGD",  // Virgin Gorda
            BviAirport.TUPY => "NGD",  // Anegada (Auguste George)
            _ => "BVI"
        };
        return $"SVC-{airportCode}-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
    }

    private static string GetServiceDescription(AirportServiceType serviceType) => serviceType switch
    {
        AirportServiceType.SewerageDumping => "Sewerage disposal service",
        AirportServiceType.FireTruckStandby => "Fire truck standby service",
        AirportServiceType.FuelFlow => "Fuel flow charge",
        AirportServiceType.GroundHandling => "Ground handling service",
        AirportServiceType.AircraftTowing => "Aircraft towing service",
        AirportServiceType.WaterService => "Potable water service",
        AirportServiceType.GpuService => "Ground power unit (GPU) service",
        AirportServiceType.DeIcing => "De-icing service",
        AirportServiceType.BaggageHandling => "Baggage handling service",
        AirportServiceType.PassengerStairs => "Passenger stairs/steps service",
        AirportServiceType.LavatoryService => "Lavatory service",
        AirportServiceType.CateringAccess => "Catering vehicle access",
        _ => serviceType.ToString()
    };

    /// <summary>
    /// Marks the service log as invoiced when added to an invoice.
    /// </summary>
    public void MarkInvoiced(Guid invoiceId, string invoiceNumber)
    {
        if (Status != AirportServiceLogStatus.Pending && Status != AirportServiceLogStatus.PendingSync)
            throw new InvalidOperationException($"Cannot invoice service log in {Status} status");

        if (invoiceId == Guid.Empty)
            throw new ArgumentException("Invoice ID is required", nameof(invoiceId));
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            throw new ArgumentException("Invoice number is required", nameof(invoiceNumber));

        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
        InvoicedAt = DateTime.UtcNow;
        Status = AirportServiceLogStatus.Invoiced;
        SetUpdatedAt();
    }

    /// <summary>
    /// Cancels the service log with a reason.
    /// </summary>
    public void Cancel(string reason, string cancelledBy)
    {
        if (Status == AirportServiceLogStatus.Invoiced)
            throw new InvalidOperationException("Cannot cancel an invoiced service log");
        if (Status == AirportServiceLogStatus.Cancelled)
            throw new InvalidOperationException("Service log is already cancelled");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Cancellation reason is required", nameof(reason));
        if (string.IsNullOrWhiteSpace(cancelledBy))
            throw new ArgumentException("Cancelled by is required", nameof(cancelledBy));

        CancellationReason = reason;
        CancelledBy = cancelledBy;
        CancelledAt = DateTime.UtcNow;
        Status = AirportServiceLogStatus.Cancelled;
        SetUpdatedAt();
    }

    /// <summary>
    /// Marks an offline log as synced with the server.
    /// </summary>
    public void MarkSynced()
    {
        if (Status != AirportServiceLogStatus.PendingSync)
            throw new InvalidOperationException($"Cannot sync service log in {Status} status");

        Status = AirportServiceLogStatus.Pending;
        SyncedAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    /// <summary>
    /// Updates the fee amount (requires re-authentication for amounts over threshold).
    /// </summary>
    public void UpdateFee(Money newFeeAmount, string updatedBy, string reason)
    {
        if (Status != AirportServiceLogStatus.Pending)
            throw new InvalidOperationException($"Cannot update fee on service log in {Status} status");

        if (string.IsNullOrWhiteSpace(updatedBy))
            throw new ArgumentException("Updated by is required", nameof(updatedBy));
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Update reason is required", nameof(reason));

        var oldAmount = FeeAmount;
        FeeAmount = newFeeAmount;
        Notes = $"{Notes}\nFee updated from {oldAmount} to {newFeeAmount} by {updatedBy}: {reason}".Trim();
        SetUpdatedAt();

        RaiseDomainEvent(new AirportServiceFeeUpdatedEvent(
            Id, LogNumber, oldAmount, newFeeAmount, updatedBy, reason));
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
