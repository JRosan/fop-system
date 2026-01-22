using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Revenue;

public class BviaInvoice : AggregateRoot<Guid>
{
    public string InvoiceNumber { get; private set; } = default!;
    public Guid OperatorId { get; private set; }
    public Guid? FopApplicationId { get; private set; }
    public BviaInvoiceStatus Status { get; private set; }

    public BviAirport ArrivalAirport { get; private set; }
    public BviAirport? DepartureAirport { get; private set; }
    public FlightOperationType OperationType { get; private set; }
    public DateOnly FlightDate { get; private set; }

    public string? AircraftRegistration { get; private set; }
    public Weight Mtow { get; private set; } = default!;
    public int SeatCount { get; private set; }
    public int? PassengerCount { get; private set; }

    public Money Subtotal { get; private set; } = default!;
    public Money TotalInterest { get; private set; } = default!;
    public Money TotalAmount { get; private set; } = default!;
    public Money AmountPaid { get; private set; } = default!;
    public Money BalanceDue { get; private set; } = default!;

    public DateOnly InvoiceDate { get; private set; }
    public DateOnly DueDate { get; private set; }

    public DateTime? FinalizedAt { get; private set; }
    public string? FinalizedBy { get; private set; }
    public DateTime? MarkedOverdueAt { get; private set; }
    public string? Notes { get; private set; }

    private readonly List<BviaInvoiceLineItem> _lineItems = [];
    public IReadOnlyList<BviaInvoiceLineItem> LineItems => _lineItems.AsReadOnly();

    private readonly List<BviaPayment> _payments = [];
    public IReadOnlyList<BviaPayment> Payments => _payments.AsReadOnly();

    private BviaInvoice() { }

    public static BviaInvoice Create(
        Guid operatorId,
        BviAirport arrivalAirport,
        BviAirport? departureAirport,
        FlightOperationType operationType,
        DateOnly flightDate,
        string? aircraftRegistration,
        Weight mtow,
        int seatCount,
        int? passengerCount = null,
        Guid? fopApplicationId = null,
        string? notes = null)
    {
        if (operatorId == Guid.Empty)
            throw new ArgumentException("Operator ID is required", nameof(operatorId));
        if (seatCount < 0)
            throw new ArgumentException("Seat count cannot be negative", nameof(seatCount));

        var invoice = new BviaInvoice
        {
            Id = Guid.NewGuid(),
            InvoiceNumber = GenerateInvoiceNumber(),
            OperatorId = operatorId,
            FopApplicationId = fopApplicationId,
            Status = BviaInvoiceStatus.Draft,
            ArrivalAirport = arrivalAirport,
            DepartureAirport = departureAirport,
            OperationType = operationType,
            FlightDate = flightDate,
            AircraftRegistration = aircraftRegistration,
            Mtow = mtow,
            SeatCount = seatCount,
            PassengerCount = passengerCount,
            Subtotal = Money.Zero(),
            TotalInterest = Money.Zero(),
            TotalAmount = Money.Zero(),
            AmountPaid = Money.Zero(),
            BalanceDue = Money.Zero(),
            InvoiceDate = DateOnly.FromDateTime(DateTime.UtcNow),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)),
            Notes = notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        invoice.RaiseDomainEvent(new BviaInvoiceCreatedEvent(
            invoice.Id,
            invoice.InvoiceNumber,
            operatorId,
            fopApplicationId));

        return invoice;
    }

    private static string GenerateInvoiceNumber()
    {
        return $"BVIA-INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
    }

    public BviaInvoiceLineItem AddLineItem(
        BviaFeeCategory category,
        string description,
        decimal quantity,
        string? quantityUnit,
        Money unitRate,
        Guid? feeRateId = null)
    {
        if (Status != BviaInvoiceStatus.Draft)
            throw new InvalidOperationException($"Cannot add line items to invoice in {Status} status");

        var displayOrder = _lineItems.Count + 1;
        var lineItem = BviaInvoiceLineItem.Create(
            Id,
            category,
            description,
            quantity,
            quantityUnit,
            unitRate,
            displayOrder,
            feeRateId);

        _lineItems.Add(lineItem);
        RecalculateTotals();
        SetUpdatedAt();

        return lineItem;
    }

    public void RemoveLineItem(Guid lineItemId)
    {
        if (Status != BviaInvoiceStatus.Draft)
            throw new InvalidOperationException($"Cannot remove line items from invoice in {Status} status");

        var lineItem = _lineItems.FirstOrDefault(li => li.Id == lineItemId)
            ?? throw new InvalidOperationException($"Line item {lineItemId} not found");

        _lineItems.Remove(lineItem);
        RecalculateTotals();
        SetUpdatedAt();
    }

    public void Finalize(string finalizedBy)
    {
        if (Status != BviaInvoiceStatus.Draft)
            throw new InvalidOperationException($"Cannot finalize invoice in {Status} status");

        if (string.IsNullOrWhiteSpace(finalizedBy))
            throw new ArgumentException("Finalized by is required", nameof(finalizedBy));

        if (_lineItems.Count == 0)
            throw new InvalidOperationException("Cannot finalize invoice with no line items");

        Status = BviaInvoiceStatus.Pending;
        FinalizedAt = DateTime.UtcNow;
        FinalizedBy = finalizedBy;
        SetUpdatedAt();

        RaiseDomainEvent(new BviaInvoiceFinalizedEvent(Id, InvoiceNumber, TotalAmount, OperatorId));
    }

    public BviaPayment RecordPayment(
        Money amount,
        PaymentMethod method,
        string? transactionReference,
        string? notes,
        string recordedBy)
    {
        if (Status == BviaInvoiceStatus.Draft || Status == BviaInvoiceStatus.Cancelled || Status == BviaInvoiceStatus.Paid)
            throw new InvalidOperationException($"Cannot record payment on invoice in {Status} status");

        if (amount.Amount > BalanceDue.Amount)
            throw new InvalidOperationException(
                $"Payment amount ({amount}) exceeds balance due ({BalanceDue})");

        var payment = BviaPayment.Create(
            Id,
            amount,
            method,
            transactionReference,
            notes,
            recordedBy);

        _payments.Add(payment);

        // Update paid amounts
        AmountPaid = AmountPaid.Add(amount);
        BalanceDue = TotalAmount.Subtract(AmountPaid);

        // Update status
        if (BalanceDue.Amount == 0)
        {
            Status = BviaInvoiceStatus.Paid;
            RaiseDomainEvent(new BviaInvoicePaidEvent(Id, InvoiceNumber, OperatorId));
        }
        else
        {
            Status = BviaInvoiceStatus.PartiallyPaid;
        }

        SetUpdatedAt();

        RaiseDomainEvent(new BviaPaymentReceivedEvent(
            payment.Id,
            Id,
            InvoiceNumber,
            amount,
            OperatorId));

        return payment;
    }

    public void MarkOverdue()
    {
        if (Status != BviaInvoiceStatus.Pending && Status != BviaInvoiceStatus.PartiallyPaid)
            throw new InvalidOperationException($"Cannot mark invoice as overdue in {Status} status");

        if (DateOnly.FromDateTime(DateTime.UtcNow) <= DueDate)
            throw new InvalidOperationException("Invoice is not yet past due date");

        Status = BviaInvoiceStatus.Overdue;
        MarkedOverdueAt = DateTime.UtcNow;
        SetUpdatedAt();

        RaiseDomainEvent(new BviaInvoiceOverdueEvent(Id, InvoiceNumber, BalanceDue, OperatorId));
    }

    public BviaInvoiceLineItem AddInterestCharge(Money interestAmount, string description)
    {
        if (Status != BviaInvoiceStatus.Overdue)
            throw new InvalidOperationException($"Cannot add interest to invoice in {Status} status");

        var displayOrder = _lineItems.Count + 1;
        var lineItem = BviaInvoiceLineItem.CreateInterestCharge(
            Id,
            description,
            interestAmount,
            displayOrder);

        _lineItems.Add(lineItem);

        // Update interest and totals
        TotalInterest = TotalInterest.Add(interestAmount);
        TotalAmount = TotalAmount.Add(interestAmount);
        BalanceDue = TotalAmount.Subtract(AmountPaid);
        SetUpdatedAt();

        return lineItem;
    }

    public void Cancel(string cancelledBy, string reason)
    {
        if (Status == BviaInvoiceStatus.Paid)
            throw new InvalidOperationException("Cannot cancel a paid invoice");

        if (string.IsNullOrWhiteSpace(cancelledBy))
            throw new ArgumentException("Cancelled by is required", nameof(cancelledBy));

        Status = BviaInvoiceStatus.Cancelled;
        Notes = $"{Notes}\nCancelled by {cancelledBy} on {DateTime.UtcNow:yyyy-MM-dd}: {reason}".Trim();
        SetUpdatedAt();
    }

    public void UpdateFlightInfo(int? passengerCount)
    {
        if (Status != BviaInvoiceStatus.Draft)
            throw new InvalidOperationException($"Cannot update flight info on invoice in {Status} status");

        PassengerCount = passengerCount;
        SetUpdatedAt();
    }

    private void RecalculateTotals()
    {
        var nonInterestItems = _lineItems.Where(li => !li.IsInterestCharge).ToList();
        var interestItems = _lineItems.Where(li => li.IsInterestCharge).ToList();

        Subtotal = nonInterestItems.Aggregate(
            Money.Zero(),
            (sum, item) => sum.Add(item.Amount));

        TotalInterest = interestItems.Aggregate(
            Money.Zero(),
            (sum, item) => sum.Add(item.Amount));

        TotalAmount = Subtotal.Add(TotalInterest);
        BalanceDue = TotalAmount.Subtract(AmountPaid);
    }

    public bool IsPastDue => DateOnly.FromDateTime(DateTime.UtcNow) > DueDate &&
                              Status != BviaInvoiceStatus.Paid &&
                              Status != BviaInvoiceStatus.Cancelled;

    public int DaysOverdue
    {
        get
        {
            if (!IsPastDue) return 0;
            return DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - DueDate.DayNumber;
        }
    }
}
