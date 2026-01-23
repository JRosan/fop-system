using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.FieldOperations.Queries;

/// <summary>
/// Query to retrieve a paged list of airport service logs with filtering options.
/// </summary>
public sealed record GetServiceLogsQuery(
    Guid? OperatorId = null,
    Guid? OfficerId = null,
    AirportServiceLogStatus[]? Statuses = null,
    BviAirport? Airport = null,
    DateOnly? FromDate = null,
    DateOnly? ToDate = null,
    int PageNumber = 1,
    int PageSize = 20) : IQuery<PagedResult<AirportServiceLogSummaryDto>>;

public sealed class GetServiceLogsQueryHandler
    : IQueryHandler<GetServiceLogsQuery, PagedResult<AirportServiceLogSummaryDto>>
{
    private readonly IAirportServiceLogRepository _repository;

    public GetServiceLogsQueryHandler(IAirportServiceLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<AirportServiceLogSummaryDto>>> Handle(
        GetServiceLogsQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetPagedAsync(
            operatorId: request.OperatorId,
            officerId: request.OfficerId,
            statuses: request.Statuses,
            airport: request.Airport,
            fromDate: request.FromDate,
            toDate: request.ToDate,
            pageNumber: request.PageNumber,
            pageSize: request.PageSize,
            cancellationToken: cancellationToken);

        var dtos = items.Select(log => new AirportServiceLogSummaryDto(
            log.Id,
            log.LogNumber,
            log.PermitNumber,
            log.AircraftRegistration,
            log.ServiceType,
            new MoneyDto(log.FeeAmount.Amount, log.FeeAmount.Currency.ToString()),
            log.Airport,
            log.LoggedAt,
            log.Status)).ToList();

        return Result.Success(new PagedResult<AirportServiceLogSummaryDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize));
    }
}
