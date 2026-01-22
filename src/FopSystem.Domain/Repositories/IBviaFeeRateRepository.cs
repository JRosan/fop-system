using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Repositories;

public interface IBviaFeeRateRepository : IRepository<BviaFeeRate, Guid>
{
    Task<IReadOnlyList<BviaFeeRate>> GetActiveRatesAsync(DateOnly effectiveDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaFeeRate>> GetByCategoryAsync(BviaFeeCategory category, CancellationToken cancellationToken = default);

    Task<BviaFeeRate?> GetRateAsync(
        BviaFeeCategory category,
        FlightOperationType operationType,
        DateOnly effectiveDate,
        BviAirport? airport = null,
        MtowTierLevel? mtowTier = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaFeeRate>> GetLandingRatesAsync(
        FlightOperationType operationType,
        DateOnly effectiveDate,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaFeeRate>> GetPassengerRatesAsync(
        BviAirport airport,
        DateOnly effectiveDate,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<BviaFeeRate> Items, int TotalCount)> GetPagedAsync(
        BviaFeeCategory? category = null,
        FlightOperationType? operationType = null,
        BviAirport? airport = null,
        bool? isActive = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
}
