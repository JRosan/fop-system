using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services.Fees;

/// <summary>
/// Default BVIAA fee policy with hardcoded rates.
/// Used as a fallback when no tenant-specific configuration exists.
/// </summary>
public class DefaultBviaFeePolicy : IBviaFeePolicy
{
    // Landing Fee Rates per 1000 lbs (or fraction thereof)
    private static readonly Dictionary<(FlightOperationType, MtowTierLevel), decimal> LandingRates = new()
    {
        // Local/Scheduled operations
        { (FlightOperationType.LocalScheduled, MtowTierLevel.Tier1), 2.50m },
        { (FlightOperationType.LocalScheduled, MtowTierLevel.Tier2), 3.00m },
        { (FlightOperationType.LocalScheduled, MtowTierLevel.Tier3), 3.50m },
        { (FlightOperationType.LocalScheduled, MtowTierLevel.Tier4), 5.00m },
        // General Aviation / Charter operations
        { (FlightOperationType.GeneralAviation, MtowTierLevel.Tier1), 5.00m },
        { (FlightOperationType.GeneralAviation, MtowTierLevel.Tier2), 10.00m },
        { (FlightOperationType.GeneralAviation, MtowTierLevel.Tier3), 12.00m },
        { (FlightOperationType.GeneralAviation, MtowTierLevel.Tier4), 15.00m },
        { (FlightOperationType.Charter, MtowTierLevel.Tier1), 5.00m },
        { (FlightOperationType.Charter, MtowTierLevel.Tier2), 10.00m },
        { (FlightOperationType.Charter, MtowTierLevel.Tier3), 12.00m },
        { (FlightOperationType.Charter, MtowTierLevel.Tier4), 15.00m },
        // Interisland uses LocalScheduled rates
        { (FlightOperationType.Interisland, MtowTierLevel.Tier1), 2.50m },
        { (FlightOperationType.Interisland, MtowTierLevel.Tier2), 3.00m },
        { (FlightOperationType.Interisland, MtowTierLevel.Tier3), 3.50m },
        { (FlightOperationType.Interisland, MtowTierLevel.Tier4), 5.00m },
    };

    // Minimum landing fees
    private static readonly Dictionary<FlightOperationType, decimal> MinimumLandingFees = new()
    {
        { FlightOperationType.LocalScheduled, 15.00m },
        { FlightOperationType.GeneralAviation, 20.00m },
        { FlightOperationType.Charter, 20.00m },
        { FlightOperationType.Interisland, 10.00m },
        { FlightOperationType.Emergency, 0.00m },
        { FlightOperationType.Military, 0.00m },
        { FlightOperationType.Government, 0.00m },
    };

    // Navigation/Communication Fee Rates by MTOW Tier
    private static readonly Dictionary<MtowTierLevel, decimal> NavigationRates = new()
    {
        { MtowTierLevel.Tier1, 5.00m },   // 0-12,500 lbs
        { MtowTierLevel.Tier2, 10.00m },  // 12,501-75,000 lbs
        { MtowTierLevel.Tier3, 15.00m },  // 75,001-100,000 lbs
        { MtowTierLevel.Tier4, 20.00m },  // Over 100,000 lbs
    };

    // Airport Development Fee by Airport (per passenger, in/out)
    private static readonly Dictionary<BviAirport, decimal> AirportDevelopmentFees = new()
    {
        { BviAirport.TUPJ, 15.00m },  // TB Lettsome
        { BviAirport.TUPW, 10.00m },  // Virgin Gorda
        { BviAirport.TUPY, 10.00m },  // Anegada
    };

    // Constants
    private const decimal InterislandAirportDevelopmentFee = 5.00m;
    private const decimal SecurityCharge = 5.00m;
    private const decimal HoldBaggageScreeningFee = 7.00m;
    private const decimal ParkingFeePercentage = 0.20m;
    private const decimal CatViFireUpgradeFee = 100.00m;
    private const decimal FlightPlanFilingFee = 20.00m;
    private const decimal FuelFlowFeePerGallon = 0.20m;
    private const decimal LightingFeePerHour = 35.00m;
    private const decimal LatePaymentInterestRate = 0.015m; // 1.5% per month

    // Extended Operations Fees
    private static readonly Dictionary<string, decimal> ExtendedOperationsFees = new()
    {
        { "Early_0400_0600", 975.00m },
        { "Late_2200_0000", 1650.00m },
        { "Late_0000_0200", 3225.00m },
    };

    public Money GetLandingRate(FlightOperationType operationType, MtowTierLevel mtowTier)
    {
        var effectiveOperationType = operationType switch
        {
            FlightOperationType.Interisland => operationType, // Keep interisland rates
            _ => operationType
        };

        var key = (effectiveOperationType, mtowTier);
        if (!LandingRates.TryGetValue(key, out var rate))
        {
            // Fall back to General Aviation rates
            key = (FlightOperationType.GeneralAviation, mtowTier);
            rate = LandingRates.GetValueOrDefault(key, 5.00m);
        }

        return Money.Usd(rate);
    }

    public Money GetMinimumLandingFee(FlightOperationType operationType) =>
        Money.Usd(MinimumLandingFees.GetValueOrDefault(operationType, 15.00m));

    public Money GetNavigationFee(MtowTierLevel mtowTier) =>
        Money.Usd(NavigationRates.GetValueOrDefault(mtowTier, 5.00m));

    public Money GetAirportDevelopmentFee(BviAirport airport, bool isInterisland)
    {
        if (isInterisland)
            return Money.Usd(InterislandAirportDevelopmentFee);

        return Money.Usd(AirportDevelopmentFees.GetValueOrDefault(airport, 10.00m));
    }

    public Money GetSecurityCharge() => Money.Usd(SecurityCharge);

    public Money GetHoldBaggageScreeningFee() => Money.Usd(HoldBaggageScreeningFee);

    public decimal GetParkingFeePercentage() => ParkingFeePercentage;

    public Money GetCatViFireUpgradeFee() => Money.Usd(CatViFireUpgradeFee);

    public Money GetFlightPlanFilingFee() => Money.Usd(FlightPlanFilingFee);

    public Money GetFuelFlowFeePerGallon() => Money.Usd(FuelFlowFeePerGallon);

    public Money GetLightingFeePerHour() => Money.Usd(LightingFeePerHour);

    public decimal GetLatePaymentInterestRate() => LatePaymentInterestRate;

    public Money GetExtendedOperationsFee(int hour)
    {
        // Early operations (04:00 - 06:00)
        if (hour >= 4 && hour < 6)
            return Money.Usd(ExtendedOperationsFees["Early_0400_0600"]);

        // Late operations (22:00 - 00:00)
        if (hour >= 22 && hour < 24)
            return Money.Usd(ExtendedOperationsFees["Late_2200_0000"]);

        // Very late operations (00:00 - 02:00)
        if (hour >= 0 && hour < 2)
            return Money.Usd(ExtendedOperationsFees["Late_0000_0200"]);

        return Money.Zero();
    }

    public string GetPolicySource() => "Default Policy";
}
