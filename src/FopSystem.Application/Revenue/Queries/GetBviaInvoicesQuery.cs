using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Revenue.Queries;

public sealed record GetBviaInvoicesQuery(
    BviaInvoiceStatus[]? Statuses = null,
    Guid? OperatorId = null,
    BviAirport? Airport = null,
    DateOnly? InvoiceDateFrom = null,
    DateOnly? InvoiceDateTo = null,
    DateOnly? FlightDateFrom = null,
    DateOnly? FlightDateTo = null,
    bool? IsOverdue = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 20) : IQuery<PagedResult<BviaInvoiceSummaryDto>>;

public sealed class GetBviaInvoicesQueryHandler : IQueryHandler<GetBviaInvoicesQuery, PagedResult<BviaInvoiceSummaryDto>>
{
    private readonly IBviaInvoiceRepository _invoiceRepository;

    public GetBviaInvoicesQueryHandler(IBviaInvoiceRepository invoiceRepository)
    {
        _invoiceRepository = invoiceRepository;
    }

    public async Task<Result<PagedResult<BviaInvoiceSummaryDto>>> Handle(GetBviaInvoicesQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _invoiceRepository.GetPagedAsync(
            statuses: request.Statuses,
            operatorId: request.OperatorId,
            airport: request.Airport,
            invoiceDateFrom: request.InvoiceDateFrom,
            invoiceDateTo: request.InvoiceDateTo,
            flightDateFrom: request.FlightDateFrom,
            flightDateTo: request.FlightDateTo,
            isOverdue: request.IsOverdue,
            search: request.Search,
            pageNumber: request.PageNumber,
            pageSize: request.PageSize,
            cancellationToken: cancellationToken);

        var dtos = items.Select(i => new BviaInvoiceSummaryDto(
            Id: i.Id,
            InvoiceNumber: i.InvoiceNumber,
            OperatorId: i.OperatorId,
            Status: i.Status,
            ArrivalAirport: i.ArrivalAirport,
            FlightDate: i.FlightDate,
            AircraftRegistration: i.AircraftRegistration,
            TotalAmount: new MoneyDto(i.TotalAmount.Amount, i.TotalAmount.Currency.ToString()),
            BalanceDue: new MoneyDto(i.BalanceDue.Amount, i.BalanceDue.Currency.ToString()),
            DueDate: i.DueDate,
            IsPastDue: i.IsPastDue,
            DaysOverdue: i.DaysOverdue)).ToList();

        return Result.Success(new PagedResult<BviaInvoiceSummaryDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize));
    }
}
