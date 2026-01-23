using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.FieldOperations.Queries;

/// <summary>
/// Query to retrieve a single airport service log by ID.
/// </summary>
public sealed record GetServiceLogQuery(Guid Id) : IQuery<AirportServiceLogDto>;

public sealed class GetServiceLogQueryHandler : IQueryHandler<GetServiceLogQuery, AirportServiceLogDto>
{
    private readonly IAirportServiceLogRepository _repository;

    public GetServiceLogQueryHandler(IAirportServiceLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AirportServiceLogDto>> Handle(
        GetServiceLogQuery request,
        CancellationToken cancellationToken)
    {
        var serviceLog = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (serviceLog is null)
        {
            return Result.Failure<AirportServiceLogDto>(Error.NotFound);
        }

        var dto = new AirportServiceLogDto(
            serviceLog.Id,
            serviceLog.LogNumber,
            serviceLog.PermitId,
            serviceLog.PermitNumber,
            serviceLog.OperatorId,
            serviceLog.AircraftRegistration,
            serviceLog.OfficerId,
            serviceLog.OfficerName,
            serviceLog.ServiceType,
            serviceLog.ServiceDescription,
            new MoneyDto(serviceLog.FeeAmount.Amount, serviceLog.FeeAmount.Currency.ToString()),
            serviceLog.Quantity,
            serviceLog.QuantityUnit,
            new MoneyDto(serviceLog.UnitRate.Amount, serviceLog.UnitRate.Currency.ToString()),
            serviceLog.Location is not null
                ? new GeoCoordinateDto(
                    serviceLog.Location.Latitude,
                    serviceLog.Location.Longitude,
                    serviceLog.Location.Accuracy)
                : null,
            serviceLog.Airport,
            serviceLog.LoggedAt,
            serviceLog.Notes,
            serviceLog.Status,
            serviceLog.InvoiceId,
            serviceLog.InvoiceNumber,
            serviceLog.InvoicedAt,
            serviceLog.WasOfflineLog,
            serviceLog.SyncedAt);

        return Result.Success(dto);
    }
}
