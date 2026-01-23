using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services.Fees;

/// <summary>
/// BVIA fee policy that loads rates from BviaFeeRate entities.
/// Falls back to default policy if specific rates are not found.
/// </summary>
public class DatabaseBviaFeePolicy : IBviaFeePolicy
{
    private readonly IReadOnlyList<BviaFeeRate> _rates;
    private readonly IBviaFeePolicy _fallbackPolicy;
    private readonly DateOnly _effectiveDate;

    // Cached lookups for performance
    private readonly Dictionary<(FlightOperationType, MtowTierLevel), BviaFeeRate?> _landingRateCache = new();
    private readonly Dictionary<MtowTierLevel, BviaFeeRate?> _navigationRateCache = new();
    private readonly Dictionary<(BviAirport, bool), BviaFeeRate?> _airportDevFeeCache = new();

    public DatabaseBviaFeePolicy(IReadOnlyList<BviaFeeRate> rates, DateOnly effectiveDate)
        : this(rates, effectiveDate, new DefaultBviaFeePolicy())
    {
    }

    public DatabaseBviaFeePolicy(IReadOnlyList<BviaFeeRate> rates, DateOnly effectiveDate, IBviaFeePolicy fallbackPolicy)
    {
        _rates = rates ?? throw new ArgumentNullException(nameof(rates));
        _effectiveDate = effectiveDate;
        _fallbackPolicy = fallbackPolicy;
    }

    public Money GetLandingRate(FlightOperationType operationType, MtowTierLevel mtowTier)
    {
        var key = (operationType, mtowTier);
        if (!_landingRateCache.TryGetValue(key, out var cachedRate))
        {
            cachedRate = FindRate(BviaFeeCategory.Landing, operationType, mtowTier: mtowTier);
            _landingRateCache[key] = cachedRate;
        }

        return cachedRate?.Rate ?? _fallbackPolicy.GetLandingRate(operationType, mtowTier);
    }

    public Money GetMinimumLandingFee(FlightOperationType operationType)
    {
        var rate = FindRate(BviaFeeCategory.Landing, operationType);
        return rate?.MinimumFee ?? _fallbackPolicy.GetMinimumLandingFee(operationType);
    }

    public Money GetNavigationFee(MtowTierLevel mtowTier)
    {
        if (!_navigationRateCache.TryGetValue(mtowTier, out var cachedRate))
        {
            // Navigation fees are typically the same across operation types for a given tier
            cachedRate = FindRate(BviaFeeCategory.Navigation, null, mtowTier: mtowTier);
            _navigationRateCache[mtowTier] = cachedRate;
        }

        return cachedRate?.Rate ?? _fallbackPolicy.GetNavigationFee(mtowTier);
    }

    public Money GetAirportDevelopmentFee(BviAirport airport, bool isInterisland)
    {
        var key = (airport, isInterisland);
        if (!_airportDevFeeCache.TryGetValue(key, out var cachedRate))
        {
            var opType = isInterisland ? FlightOperationType.Interisland : (FlightOperationType?)null;
            cachedRate = FindRate(BviaFeeCategory.AirportDevelopment, opType, airport: airport);
            _airportDevFeeCache[key] = cachedRate;
        }

        return cachedRate?.Rate ?? _fallbackPolicy.GetAirportDevelopmentFee(airport, isInterisland);
    }

    public Money GetSecurityCharge()
    {
        var rate = FindRate(BviaFeeCategory.Security);
        return rate?.Rate ?? _fallbackPolicy.GetSecurityCharge();
    }

    public Money GetHoldBaggageScreeningFee()
    {
        var rate = FindRate(BviaFeeCategory.HoldBaggageScreening);
        return rate?.Rate ?? _fallbackPolicy.GetHoldBaggageScreeningFee();
    }

    public decimal GetParkingFeePercentage()
    {
        var rate = FindRate(BviaFeeCategory.Parking);
        // Rate is stored as decimal (e.g., 0.20 for 20%)
        return rate?.Rate.Amount ?? _fallbackPolicy.GetParkingFeePercentage();
    }

    public Money GetCatViFireUpgradeFee()
    {
        var rate = FindRate(BviaFeeCategory.CatViFireUpgrade);
        return rate?.Rate ?? _fallbackPolicy.GetCatViFireUpgradeFee();
    }

    public Money GetFlightPlanFilingFee()
    {
        var rate = FindRate(BviaFeeCategory.FlightPlanFiling);
        return rate?.Rate ?? _fallbackPolicy.GetFlightPlanFilingFee();
    }

    public Money GetFuelFlowFeePerGallon()
    {
        var rate = FindRate(BviaFeeCategory.FuelFlow);
        return rate?.Rate ?? _fallbackPolicy.GetFuelFlowFeePerGallon();
    }

    public Money GetLightingFeePerHour()
    {
        var rate = FindRate(BviaFeeCategory.Lighting);
        return rate?.Rate ?? _fallbackPolicy.GetLightingFeePerHour();
    }

    public decimal GetLatePaymentInterestRate()
    {
        var rate = FindRate(BviaFeeCategory.LatePaymentInterest);
        // Rate is stored as decimal (e.g., 0.015 for 1.5%)
        return rate?.Rate.Amount ?? _fallbackPolicy.GetLatePaymentInterestRate();
    }

    public Money GetExtendedOperationsFee(int hour)
    {
        var rate = FindRate(BviaFeeCategory.ExtendedOperations);
        if (rate is not null)
        {
            // For now, return the base rate - more complex time-based logic would need multiple rates
            return rate.Rate;
        }

        return _fallbackPolicy.GetExtendedOperationsFee(hour);
    }

    public string GetPolicySource()
    {
        if (_rates.Count == 0)
            return _fallbackPolicy.GetPolicySource();

        var tenantId = _rates.FirstOrDefault()?.TenantId;
        return $"Database Policy (Tenant: {tenantId}, Effective: {_effectiveDate:yyyy-MM-dd}, Rates: {_rates.Count})";
    }

    private BviaFeeRate? FindRate(
        BviaFeeCategory category,
        FlightOperationType? operationType = null,
        BviAirport? airport = null,
        MtowTierLevel? mtowTier = null)
    {
        return _rates
            .Where(r => r.Category == category)
            .Where(r => operationType == null || r.OperationType == operationType)
            .Where(r => airport == null || r.Airport == airport || r.Airport == null)
            .Where(r => mtowTier == null || r.MtowTier == mtowTier || r.MtowTier == null)
            .Where(r => r.IsEffectiveOn(_effectiveDate))
            .OrderByDescending(r => r.MtowTier.HasValue) // Prefer specific tier over general
            .ThenByDescending(r => r.Airport.HasValue)   // Prefer specific airport over general
            .ThenByDescending(r => r.EffectiveFrom)      // Prefer most recent effective date
            .FirstOrDefault();
    }
}
