using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.FieldOperations.Queries;

public sealed record GetCachedPermitsQuery(
    Guid? OperatorId = null,
    PermitStatus[]? Statuses = null,
    int MaxResults = 100) : IQuery<IReadOnlyList<CachedPermitDto>>;

public sealed class GetCachedPermitsQueryHandler : IQueryHandler<GetCachedPermitsQuery, IReadOnlyList<CachedPermitDto>>
{
    private readonly IPermitRepository _permitRepository;
    private readonly IJwtPermitTokenService _tokenService;

    public GetCachedPermitsQueryHandler(
        IPermitRepository permitRepository,
        IJwtPermitTokenService tokenService)
    {
        _permitRepository = permitRepository;
        _tokenService = tokenService;
    }

    public async Task<Result<IReadOnlyList<CachedPermitDto>>> Handle(
        GetCachedPermitsQuery request,
        CancellationToken cancellationToken)
    {
        var statuses = request.Statuses ?? new[] { PermitStatus.Active };

        var (permits, _) = await _permitRepository.GetPagedAsync(
            statuses: statuses,
            operatorId: request.OperatorId,
            pageNumber: 1,
            pageSize: request.MaxResults,
            cancellationToken: cancellationToken);

        var cachedPermits = new List<CachedPermitDto>();

        foreach (var permit in permits)
        {
            var (token, expiresAt) = await _tokenService.GenerateTokenAsync(permit);

            cachedPermits.Add(new CachedPermitDto(
                PermitId: permit.Id,
                PermitNumber: permit.PermitNumber,
                OperatorId: permit.OperatorId,
                OperatorName: permit.OperatorName,
                AircraftRegistration: permit.AircraftRegistration,
                ValidFrom: permit.ValidFrom,
                ValidUntil: permit.ValidUntil,
                Status: permit.Status,
                JwtToken: token,
                TokenExpiresAt: expiresAt));
        }

        return Result.Success<IReadOnlyList<CachedPermitDto>>(cachedPermits);
    }
}
