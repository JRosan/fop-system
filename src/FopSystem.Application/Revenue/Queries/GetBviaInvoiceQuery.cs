using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Revenue.Queries;

public sealed record GetBviaInvoiceQuery(Guid InvoiceId) : IQuery<BviaInvoiceDto>;

public sealed class GetBviaInvoiceQueryHandler : IQueryHandler<GetBviaInvoiceQuery, BviaInvoiceDto>
{
    private readonly IBviaInvoiceRepository _invoiceRepository;

    public GetBviaInvoiceQueryHandler(IBviaInvoiceRepository invoiceRepository)
    {
        _invoiceRepository = invoiceRepository;
    }

    public async Task<Result<BviaInvoiceDto>> Handle(GetBviaInvoiceQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId, cancellationToken);

        if (invoice is null)
        {
            return Result.Failure<BviaInvoiceDto>(Error.NotFound);
        }

        var dto = MapToDto(invoice);
        return Result.Success(dto);
    }

    private static BviaInvoiceDto MapToDto(Domain.Aggregates.Revenue.BviaInvoice invoice)
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
