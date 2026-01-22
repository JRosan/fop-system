using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.Revenue.Commands;

public sealed record GeneratePreArrivalInvoiceCommand(
    Guid OperatorId,
    BviAirport ArrivalAirport,
    BviAirport? DepartureAirport,
    FlightOperationType OperationType,
    DateOnly FlightDate,
    string? AircraftRegistration,
    decimal MtowLbs,
    int SeatCount,
    int? PassengerCount = null,
    Guid? FopApplicationId = null,
    string? Notes = null) : ICommand<BviaInvoiceDto>;

public sealed class GeneratePreArrivalInvoiceCommandValidator : AbstractValidator<GeneratePreArrivalInvoiceCommand>
{
    public GeneratePreArrivalInvoiceCommandValidator()
    {
        RuleFor(x => x.OperatorId).NotEmpty();
        RuleFor(x => x.MtowLbs).GreaterThan(0);
        RuleFor(x => x.SeatCount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FlightDate).GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-7)));
    }
}

public sealed class GeneratePreArrivalInvoiceCommandHandler : ICommandHandler<GeneratePreArrivalInvoiceCommand, BviaInvoiceDto>
{
    private readonly IBviaInvoiceRepository _invoiceRepository;
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IBviaFeeCalculationService _feeCalculationService;
    private readonly IUnitOfWork _unitOfWork;

    public GeneratePreArrivalInvoiceCommandHandler(
        IBviaInvoiceRepository invoiceRepository,
        IOperatorAccountBalanceRepository accountBalanceRepository,
        IBviaFeeCalculationService feeCalculationService,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _accountBalanceRepository = accountBalanceRepository;
        _feeCalculationService = feeCalculationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BviaInvoiceDto>> Handle(GeneratePreArrivalInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Create invoice
        var mtow = Weight.Pounds(request.MtowLbs);
        var invoice = BviaInvoice.Create(
            operatorId: request.OperatorId,
            arrivalAirport: request.ArrivalAirport,
            departureAirport: request.DepartureAirport,
            operationType: request.OperationType,
            flightDate: request.FlightDate,
            aircraftRegistration: request.AircraftRegistration,
            mtow: mtow,
            seatCount: request.SeatCount,
            passengerCount: request.PassengerCount,
            fopApplicationId: request.FopApplicationId,
            notes: request.Notes);

        // Calculate fees
        var feeRequest = new BviaFeeCalculationRequest(
            MtowLbs: request.MtowLbs,
            OperationType: request.OperationType,
            Airport: request.ArrivalAirport,
            PassengerCount: request.PassengerCount ?? 0);

        var feeResult = _feeCalculationService.Calculate(feeRequest);

        // Add line items from fee calculation
        foreach (var item in feeResult.Breakdown)
        {
            invoice.AddLineItem(
                category: item.Category,
                description: item.Description,
                quantity: 1,
                quantityUnit: null,
                unitRate: item.Amount);
        }

        await _invoiceRepository.AddAsync(invoice, cancellationToken);

        // Ensure account balance exists
        await _accountBalanceRepository.GetOrCreateAsync(request.OperatorId, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(MapToDto(invoice));
    }

    private static BviaInvoiceDto MapToDto(BviaInvoice invoice)
    {
        return new BviaInvoiceDto(
            Id: invoice.Id,
            InvoiceNumber: invoice.InvoiceNumber,
            OperatorId: invoice.OperatorId,
            FopApplicationId: invoice.FopApplicationId,
            Status: invoice.Status,
            ArrivalAirport: invoice.ArrivalAirport,
            DepartureAirport: invoice.DepartureAirport,
            OperationType: invoice.OperationType,
            FlightDate: invoice.FlightDate,
            AircraftRegistration: invoice.AircraftRegistration,
            Mtow: new WeightDto(invoice.Mtow.Value, invoice.Mtow.Unit.ToString()),
            SeatCount: invoice.SeatCount,
            PassengerCount: invoice.PassengerCount,
            Subtotal: new MoneyDto(invoice.Subtotal.Amount, invoice.Subtotal.Currency.ToString()),
            TotalInterest: new MoneyDto(invoice.TotalInterest.Amount, invoice.TotalInterest.Currency.ToString()),
            TotalAmount: new MoneyDto(invoice.TotalAmount.Amount, invoice.TotalAmount.Currency.ToString()),
            AmountPaid: new MoneyDto(invoice.AmountPaid.Amount, invoice.AmountPaid.Currency.ToString()),
            BalanceDue: new MoneyDto(invoice.BalanceDue.Amount, invoice.BalanceDue.Currency.ToString()),
            InvoiceDate: invoice.InvoiceDate,
            DueDate: invoice.DueDate,
            IsPastDue: invoice.IsPastDue,
            DaysOverdue: invoice.DaysOverdue,
            FinalizedAt: invoice.FinalizedAt,
            FinalizedBy: invoice.FinalizedBy,
            Notes: invoice.Notes,
            LineItems: invoice.LineItems.Select(li => new BviaInvoiceLineItemDto(
                Id: li.Id,
                Category: li.Category,
                Description: li.Description,
                Quantity: li.Quantity,
                QuantityUnit: li.QuantityUnit,
                UnitRate: new MoneyDto(li.UnitRate.Amount, li.UnitRate.Currency.ToString()),
                Amount: new MoneyDto(li.Amount.Amount, li.Amount.Currency.ToString()),
                DisplayOrder: li.DisplayOrder,
                IsInterestCharge: li.IsInterestCharge)).ToList(),
            Payments: invoice.Payments.Select(p => new BviaPaymentDto(
                Id: p.Id,
                Amount: new MoneyDto(p.Amount.Amount, p.Amount.Currency.ToString()),
                Method: p.Method,
                Status: p.Status,
                TransactionReference: p.TransactionReference,
                PaymentDate: p.PaymentDate,
                ReceiptNumber: p.ReceiptNumber,
                Notes: p.Notes,
                RecordedBy: p.RecordedBy,
                RecordedAt: p.RecordedAt)).ToList(),
            CreatedAt: invoice.CreatedAt,
            UpdatedAt: invoice.UpdatedAt);
    }
}
