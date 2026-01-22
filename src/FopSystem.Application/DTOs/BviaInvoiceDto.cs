using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public sealed record BviaInvoiceDto(
    Guid Id,
    string InvoiceNumber,
    Guid OperatorId,
    Guid? FopApplicationId,
    BviaInvoiceStatus Status,
    BviAirport ArrivalAirport,
    BviAirport? DepartureAirport,
    FlightOperationType OperationType,
    DateOnly FlightDate,
    string? AircraftRegistration,
    WeightDto Mtow,
    int SeatCount,
    int? PassengerCount,
    MoneyDto Subtotal,
    MoneyDto TotalInterest,
    MoneyDto TotalAmount,
    MoneyDto AmountPaid,
    MoneyDto BalanceDue,
    DateOnly InvoiceDate,
    DateOnly DueDate,
    bool IsPastDue,
    int DaysOverdue,
    DateTime? FinalizedAt,
    string? FinalizedBy,
    string? Notes,
    IReadOnlyList<BviaInvoiceLineItemDto> LineItems,
    IReadOnlyList<BviaPaymentDto> Payments,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record BviaInvoiceSummaryDto(
    Guid Id,
    string InvoiceNumber,
    Guid OperatorId,
    BviaInvoiceStatus Status,
    BviAirport ArrivalAirport,
    DateOnly FlightDate,
    string? AircraftRegistration,
    MoneyDto TotalAmount,
    MoneyDto BalanceDue,
    DateOnly DueDate,
    bool IsPastDue,
    int DaysOverdue);

public sealed record BviaInvoiceLineItemDto(
    Guid Id,
    BviaFeeCategory Category,
    string Description,
    decimal Quantity,
    string? QuantityUnit,
    MoneyDto UnitRate,
    MoneyDto Amount,
    int DisplayOrder,
    bool IsInterestCharge);

public sealed record BviaPaymentDto(
    Guid Id,
    MoneyDto Amount,
    PaymentMethod Method,
    PaymentStatus Status,
    string? TransactionReference,
    DateTime? PaymentDate,
    string? ReceiptNumber,
    string? Notes,
    string? RecordedBy,
    DateTime? RecordedAt);
