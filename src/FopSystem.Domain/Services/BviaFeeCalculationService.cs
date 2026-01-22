using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services;

public interface IBviaFeeCalculationService
{
    BviaFeeCalculationResult Calculate(BviaFeeCalculationRequest request);
    Money CalculateLandingFee(decimal mtowLbs, FlightOperationType operationType);
    Money CalculateNavigationFee(decimal mtowLbs);
    Money CalculateParkingFee(Money landingFee, int eightHourBlocks);
    Money CalculatePassengerFees(int passengerCount, BviAirport airport, bool isDeparting);
    Money CalculateExtendedOperationsFee(TimeOnly scheduledTime, bool isArrival);
    Money CalculateLightingFee(int hours);
    Money CalculateInterest(Money principalAmount, int daysOverdue);
}

public class BviaFeeCalculationService : IBviaFeeCalculationService
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

    public BviaFeeCalculationResult Calculate(BviaFeeCalculationRequest request)
    {
        var breakdown = new List<BviaFeeBreakdownItem>();
        var mtowTier = MtowTier.FromPounds(request.MtowLbs);

        // 1. Landing Fee
        var landingFee = CalculateLandingFee(request.MtowLbs, request.OperationType);
        breakdown.Add(new BviaFeeBreakdownItem(
            BviaFeeCategory.Landing,
            $"Landing Fee ({mtowTier.Level}, {request.OperationType})",
            landingFee));

        // 2. Navigation/Communication Fee
        var navigationFee = CalculateNavigationFee(request.MtowLbs);
        breakdown.Add(new BviaFeeBreakdownItem(
            BviaFeeCategory.Navigation,
            $"Navigation/Communication Fee ({mtowTier.Level})",
            navigationFee));

        // 3. CAT-VI Fire Upgrade (if applicable - typically for large jets)
        if (request.RequiresCatViFire)
        {
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.CatViFireUpgrade,
                "CAT-VI Fire Upgrade",
                Money.Usd(CatViFireUpgradeFee)));
        }

        // 4. Parking Fee (if hours specified)
        if (request.ParkingHours > 0)
        {
            var eightHourBlocks = (int)Math.Ceiling(request.ParkingHours / 8.0);
            var parkingFee = CalculateParkingFee(landingFee, eightHourBlocks);
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.Parking,
                $"Parking/Ramp Fee ({eightHourBlocks} × 8-hour blocks)",
                parkingFee));
        }

        // 5. Passenger-based fees (if passengers specified)
        if (request.PassengerCount > 0)
        {
            var passengerFees = CalculatePassengerFees(
                request.PassengerCount,
                request.Airport,
                isDeparting: true);

            var airportDevFee = GetAirportDevelopmentRate(request.Airport, request.IsInterisland);
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.AirportDevelopment,
                $"Airport Development Fee ({request.PassengerCount} pax × ${airportDevFee:F2})",
                Money.Usd(request.PassengerCount * airportDevFee)));

            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.Security,
                $"Security Charge ({request.PassengerCount} pax × ${SecurityCharge:F2})",
                Money.Usd(request.PassengerCount * SecurityCharge)));

            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.HoldBaggageScreening,
                $"Hold Baggage Screening ({request.PassengerCount} pax × ${HoldBaggageScreeningFee:F2})",
                Money.Usd(request.PassengerCount * HoldBaggageScreeningFee)));
        }

        // 6. Extended Operations Fee (if outside standard hours)
        if (request.OperatingWindow is not null && request.OperatingWindow.RequiresExtendedOperations)
        {
            var extendedFee = CalculateExtendedOperationsFee(
                request.OperatingWindow.ScheduledArrivalTime,
                isArrival: true);
            if (extendedFee.Amount > 0)
            {
                breakdown.Add(new BviaFeeBreakdownItem(
                    BviaFeeCategory.ExtendedOperations,
                    "Extended/Early Operations Fee",
                    extendedFee));
            }
        }

        // 7. Lighting Fee
        if (request.OperatingWindow is not null && request.OperatingWindow.RequiresLighting)
        {
            var lightingFee = CalculateLightingFee(request.OperatingWindow.LightingHours);
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.Lighting,
                $"Lighting Fee ({request.OperatingWindow.LightingHours} hours)",
                lightingFee));
        }

        // 8. Flight Plan Filing Fee
        if (request.IncludeFlightPlanFiling)
        {
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.FlightPlanFiling,
                "Flight Plan Filing Fee",
                Money.Usd(FlightPlanFilingFee)));
        }

        // 9. Fuel Flow Fee
        if (request.FuelGallons > 0)
        {
            var fuelFee = Money.Usd(request.FuelGallons * FuelFlowFeePerGallon);
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.FuelFlow,
                $"Fuel Flow Fee ({request.FuelGallons:N0} gallons × ${FuelFlowFeePerGallon:F2})",
                fuelFee));
        }

        // Calculate totals
        var totalFee = breakdown.Aggregate(Money.Zero(), (sum, item) => sum.Add(item.Amount));

        return new BviaFeeCalculationResult(
            TotalFee: totalFee,
            LandingFee: landingFee,
            NavigationFee: navigationFee,
            MtowTier: mtowTier.Level,
            Breakdown: breakdown);
    }

    public Money CalculateLandingFee(decimal mtowLbs, FlightOperationType operationType)
    {
        if (mtowLbs < 0)
            throw new ArgumentException("MTOW cannot be negative", nameof(mtowLbs));

        // Special handling for exempt operation types
        if (operationType is FlightOperationType.Emergency or FlightOperationType.Military or FlightOperationType.Government)
        {
            return Money.Zero();
        }

        var mtowTier = MtowTier.FromPounds(mtowLbs);
        var effectiveOperationType = operationType switch
        {
            FlightOperationType.Interisland => FlightOperationType.LocalScheduled,
            _ => operationType
        };

        // Get rate, defaulting to General Aviation if not found
        var key = (effectiveOperationType, mtowTier.Level);
        if (!LandingRates.TryGetValue(key, out var ratePerThousandLbs))
        {
            key = (FlightOperationType.GeneralAviation, mtowTier.Level);
            ratePerThousandLbs = LandingRates.GetValueOrDefault(key, 5.00m);
        }

        // Calculate fee: rate per 1000 lbs (or fraction thereof)
        var thousandLbsUnits = Math.Ceiling(mtowLbs / 1000m);
        var calculatedFee = thousandLbsUnits * ratePerThousandLbs;

        // Apply minimum
        var minimumFee = MinimumLandingFees.GetValueOrDefault(operationType, 15.00m);
        var finalFee = Math.Max(calculatedFee, minimumFee);

        return Money.Usd(finalFee);
    }

    public Money CalculateNavigationFee(decimal mtowLbs)
    {
        if (mtowLbs < 0)
            throw new ArgumentException("MTOW cannot be negative", nameof(mtowLbs));

        var mtowTier = MtowTier.FromPounds(mtowLbs);
        var rate = NavigationRates.GetValueOrDefault(mtowTier.Level, 5.00m);
        return Money.Usd(rate);
    }

    public Money CalculateParkingFee(Money landingFee, int eightHourBlocks)
    {
        if (eightHourBlocks <= 0)
            return Money.Zero();

        // 20% of landing fee per 8-hour block
        var parkingPerBlock = landingFee.Multiply(ParkingFeePercentage);
        return parkingPerBlock.Multiply(eightHourBlocks);
    }

    public Money CalculatePassengerFees(int passengerCount, BviAirport airport, bool isDeparting)
    {
        if (passengerCount <= 0)
            return Money.Zero();

        var airportDevFee = AirportDevelopmentFees.GetValueOrDefault(airport, 10.00m);
        var securityFee = SecurityCharge;
        var baggageFee = isDeparting ? HoldBaggageScreeningFee : 0;

        var perPassengerFee = airportDevFee + securityFee + baggageFee;
        return Money.Usd(passengerCount * perPassengerFee);
    }

    public Money CalculateExtendedOperationsFee(TimeOnly scheduledTime, bool isArrival)
    {
        // Standard operating hours: 06:00 - 22:00
        var hour = scheduledTime.Hour;

        // Early operations (04:00 - 06:00)
        if (hour >= 4 && hour < 6)
        {
            return Money.Usd(ExtendedOperationsFees["Early_0400_0600"]);
        }

        // Late operations (22:00 - 00:00)
        if (hour >= 22 && hour < 24)
        {
            return Money.Usd(ExtendedOperationsFees["Late_2200_0000"]);
        }

        // Very late operations (00:00 - 02:00)
        if (hour >= 0 && hour < 2)
        {
            return Money.Usd(ExtendedOperationsFees["Late_0000_0200"]);
        }

        return Money.Zero();
    }

    public Money CalculateLightingFee(int hours)
    {
        if (hours <= 0)
            return Money.Zero();

        return Money.Usd(hours * LightingFeePerHour);
    }

    public Money CalculateInterest(Money principalAmount, int daysOverdue)
    {
        if (daysOverdue <= 30)
            return Money.Zero();

        // 1.5% per month (pro-rated by days over 30)
        var monthsOverdue = (daysOverdue - 30) / 30.0m;
        var interestAmount = principalAmount.Amount * LatePaymentInterestRate * monthsOverdue;

        return Money.Create(Math.Round(interestAmount, 2), principalAmount.Currency);
    }

    private static decimal GetAirportDevelopmentRate(BviAirport airport, bool isInterisland)
    {
        if (isInterisland)
            return InterislandAirportDevelopmentFee;

        return AirportDevelopmentFees.GetValueOrDefault(airport, 10.00m);
    }
}

public sealed record BviaFeeCalculationRequest(
    decimal MtowLbs,
    FlightOperationType OperationType,
    BviAirport Airport,
    int PassengerCount = 0,
    int ParkingHours = 0,
    OperatingWindow? OperatingWindow = null,
    bool RequiresCatViFire = false,
    bool IncludeFlightPlanFiling = false,
    decimal FuelGallons = 0,
    bool IsInterisland = false);

public sealed record BviaFeeCalculationResult(
    Money TotalFee,
    Money LandingFee,
    Money NavigationFee,
    MtowTierLevel MtowTier,
    IReadOnlyList<BviaFeeBreakdownItem> Breakdown);

public sealed record BviaFeeBreakdownItem(
    BviaFeeCategory Category,
    string Description,
    Money Amount);
