using FopSystem.Application.Common;
using FopSystem.Application.FeeConfiguration.Commands;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.FeeConfiguration.Queries;

public sealed record GetActiveFeeConfigurationQuery : IQuery<FeeConfigurationDto>;

public sealed class GetActiveFeeConfigurationQueryHandler : IQueryHandler<GetActiveFeeConfigurationQuery, FeeConfigurationDto>
{
    private readonly IFeeConfigurationRepository _repository;

    public GetActiveFeeConfigurationQueryHandler(IFeeConfigurationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<FeeConfigurationDto>> Handle(
        GetActiveFeeConfigurationQuery request,
        CancellationToken cancellationToken)
    {
        var config = await _repository.GetActiveAsync(cancellationToken);
        if (config is null)
        {
            return Result.Failure<FeeConfigurationDto>(
                Error.Custom("FeeConfiguration.NotFound", "No active fee configuration found"));
        }

        return Result.Success(MapToDto(config));
    }

    private static FeeConfigurationDto MapToDto(Domain.Entities.FeeConfiguration config) => new(
        config.Id,
        config.BaseFeeUsd,
        config.PerSeatFeeUsd,
        config.PerKgFeeUsd,
        config.OneTimeMultiplier,
        config.BlanketMultiplier,
        config.EmergencyMultiplier,
        config.IsActive,
        config.EffectiveFrom,
        config.EffectiveTo,
        config.ModifiedBy,
        config.Notes,
        config.CreatedAt,
        config.UpdatedAt);
}

public sealed record GetFeeConfigurationsQuery(
    bool? IsActive = null,
    int PageNumber = 1,
    int PageSize = 20) : IQuery<PagedResult<FeeConfigurationDto>>;

public sealed class GetFeeConfigurationsQueryHandler : IQueryHandler<GetFeeConfigurationsQuery, PagedResult<FeeConfigurationDto>>
{
    private readonly IFeeConfigurationRepository _repository;

    public GetFeeConfigurationsQueryHandler(IFeeConfigurationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<FeeConfigurationDto>>> Handle(
        GetFeeConfigurationsQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetPagedAsync(
            request.IsActive,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(MapToDto).ToList();

        return Result.Success(new PagedResult<FeeConfigurationDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize));
    }

    private static FeeConfigurationDto MapToDto(Domain.Entities.FeeConfiguration config) => new(
        config.Id,
        config.BaseFeeUsd,
        config.PerSeatFeeUsd,
        config.PerKgFeeUsd,
        config.OneTimeMultiplier,
        config.BlanketMultiplier,
        config.EmergencyMultiplier,
        config.IsActive,
        config.EffectiveFrom,
        config.EffectiveTo,
        config.ModifiedBy,
        config.Notes,
        config.CreatedAt,
        config.UpdatedAt);
}
