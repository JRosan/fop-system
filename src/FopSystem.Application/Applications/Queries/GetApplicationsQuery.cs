using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Queries;

public sealed record GetApplicationsQuery(
    ApplicationStatus[]? Statuses = null,
    ApplicationType[]? Types = null,
    Guid? OperatorId = null,
    DateTime? SubmittedFrom = null,
    DateTime? SubmittedTo = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 20,
    bool? IsFlagged = null) : IQuery<PagedResult<ApplicationSummaryDto>>;

public sealed class GetApplicationsQueryHandler : IQueryHandler<GetApplicationsQuery, PagedResult<ApplicationSummaryDto>>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IAircraftRepository _aircraftRepository;

    public GetApplicationsQueryHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository,
        IAircraftRepository aircraftRepository)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
        _aircraftRepository = aircraftRepository;
    }

    public async Task<Result<PagedResult<ApplicationSummaryDto>>> Handle(
        GetApplicationsQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _applicationRepository.GetPagedAsync(
            request.Statuses,
            request.Types,
            request.OperatorId,
            request.SubmittedFrom,
            request.SubmittedTo,
            request.Search,
            request.PageNumber,
            request.PageSize,
            request.IsFlagged,
            cancellationToken);

        var operatorIds = items.Select(a => a.OperatorId).Distinct().ToList();
        var aircraftIds = items.Select(a => a.AircraftId).Distinct().ToList();

        var operators = new Dictionary<Guid, string>();
        var aircraft = new Dictionary<Guid, string>();

        foreach (var id in operatorIds)
        {
            var op = await _operatorRepository.GetByIdAsync(id, cancellationToken);
            if (op is not null) operators[id] = op.Name;
        }

        foreach (var id in aircraftIds)
        {
            var ac = await _aircraftRepository.GetByIdAsync(id, cancellationToken);
            if (ac is not null) aircraft[id] = ac.RegistrationMark;
        }

        var dtos = items.Select(a => new ApplicationSummaryDto(
            a.Id,
            a.ApplicationNumber,
            a.Type,
            a.Status,
            operators.GetValueOrDefault(a.OperatorId, "Unknown"),
            aircraft.GetValueOrDefault(a.AircraftId, "Unknown"),
            new MoneyDto(a.CalculatedFee.Amount, a.CalculatedFee.Currency.ToString()),
            a.SubmittedAt,
            a.CreatedAt,
            a.IsFlagged,
            a.FlagReason)).ToList();

        return Result.Success(PagedResult<ApplicationSummaryDto>.Create(
            dtos, totalCount, request.PageNumber, request.PageSize));
    }
}
