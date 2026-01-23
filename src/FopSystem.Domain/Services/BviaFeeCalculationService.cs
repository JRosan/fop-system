using FopSystem.Domain.Enums;
using FopSystem.Domain.Services.Fees;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services;

public interface IBviaFeeCalculationService
{
    BviaFeeCalculationResult Calculate(BviaFeeCalculationRequest request);
    BviaFeeCalculationResult Calculate(BviaFeeCalculationRequest request, IBviaFeePolicy policy);
    Money CalculateLandingFee(decimal mtowLbs, FlightOperationType operationType);
    Money CalculateLandingFee(decimal mtowLbs, FlightOperationType operationType, IBviaFeePolicy policy);
    Money CalculateNavigationFee(decimal mtowLbs);
    Money CalculateNavigationFee(decimal mtowLbs, IBviaFeePolicy policy);
    Money CalculateParkingFee(Money landingFee, int eightHourBlocks);
    Money CalculateParkingFee(Money landingFee, int eightHourBlocks, IBviaFeePolicy policy);
    Money CalculatePassengerFees(int passengerCount, BviAirport airport, bool isDeparting);
    Money CalculatePassengerFees(int passengerCount, BviAirport airport, bool isDeparting, bool isInterisland, IBviaFeePolicy policy);
    Money CalculateExtendedOperationsFee(TimeOnly scheduledTime, bool isArrival);
    Money CalculateExtendedOperationsFee(TimeOnly scheduledTime, bool isArrival, IBviaFeePolicy policy);
    Money CalculateLightingFee(int hours);
    Money CalculateLightingFee(int hours, IBviaFeePolicy policy);
    Money CalculateInterest(Money principalAmount, int daysOverdue);
    Money CalculateInterest(Money principalAmount, int daysOverdue, IBviaFeePolicy policy);
}

public class BviaFeeCalculationService : IBviaFeeCalculationService
{
    private readonly IBviaFeePolicy _defaultPolicy;

    public BviaFeeCalculationService() : this(new DefaultBviaFeePolicy())
    {
    }

    public BviaFeeCalculationService(IBviaFeePolicy defaultPolicy)
    {
        _defaultPolicy = defaultPolicy ?? throw new ArgumentNullException(nameof(defaultPolicy));
    }

    public BviaFeeCalculationResult Calculate(BviaFeeCalculationRequest request)
    {
        return Calculate(request, _defaultPolicy);
    }

    public BviaFeeCalculationResult Calculate(BviaFeeCalculationRequest request, IBviaFeePolicy policy)
    {
        var breakdown = new List<BviaFeeBreakdownItem>();
        var mtowTier = MtowTier.FromPounds(request.MtowLbs);

        // 1. Landing Fee
        var landingFee = CalculateLandingFee(request.MtowLbs, request.OperationType, policy);
        breakdown.Add(new BviaFeeBreakdownItem(
            BviaFeeCategory.Landing,
            $"Landing Fee ({mtowTier.Level}, {request.OperationType})",
            landingFee));

        // 2. Navigation/Communication Fee
        var navigationFee = CalculateNavigationFee(request.MtowLbs, policy);
        breakdown.Add(new BviaFeeBreakdownItem(
            BviaFeeCategory.Navigation,
            $"Navigation/Communication Fee ({mtowTier.Level})",
            navigationFee));

        // 3. CAT-VI Fire Upgrade (if applicable - typically for large jets)
        if (request.RequiresCatViFire)
        {
            var catViFee = policy.GetCatViFireUpgradeFee();
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.CatViFireUpgrade,
                "CAT-VI Fire Upgrade",
                catViFee));
        }

        // 4. Parking Fee (if hours specified)
        if (request.ParkingHours > 0)
        {
            var eightHourBlocks = (int)Math.Ceiling(request.ParkingHours / 8.0);
            var parkingFee = CalculateParkingFee(landingFee, eightHourBlocks, policy);
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.Parking,
                $"Parking/Ramp Fee ({eightHourBlocks} × 8-hour blocks)",
                parkingFee));
        }

        // 5. Passenger-based fees (if passengers specified)
        if (request.PassengerCount > 0)
        {
            var airportDevFee = policy.GetAirportDevelopmentFee(request.Airport, request.IsInterisland);
            var securityCharge = policy.GetSecurityCharge();
            var baggageFee = policy.GetHoldBaggageScreeningFee();

            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.AirportDevelopment,
                $"Airport Development Fee ({request.PassengerCount} pax × ${airportDevFee.Amount:F2})",
                Money.Usd(request.PassengerCount * airportDevFee.Amount)));

            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.Security,
                $"Security Charge ({request.PassengerCount} pax × ${securityCharge.Amount:F2})",
                Money.Usd(request.PassengerCount * securityCharge.Amount)));

            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.HoldBaggageScreening,
                $"Hold Baggage Screening ({request.PassengerCount} pax × ${baggageFee.Amount:F2})",
                Money.Usd(request.PassengerCount * baggageFee.Amount)));
        }

        // 6. Extended Operations Fee (if outside standard hours)
        if (request.OperatingWindow is not null && request.OperatingWindow.RequiresExtendedOperations)
        {
            var extendedFee = CalculateExtendedOperationsFee(
                request.OperatingWindow.ScheduledArrivalTime,
                isArrival: true,
                policy);
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
            var lightingFee = CalculateLightingFee(request.OperatingWindow.LightingHours, policy);
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.Lighting,
                $"Lighting Fee ({request.OperatingWindow.LightingHours} hours)",
                lightingFee));
        }

        // 8. Flight Plan Filing Fee
        if (request.IncludeFlightPlanFiling)
        {
            var filingFee = policy.GetFlightPlanFilingFee();
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.FlightPlanFiling,
                "Flight Plan Filing Fee",
                filingFee));
        }

        // 9. Fuel Flow Fee
        if (request.FuelGallons > 0)
        {
            var fuelFlowRate = policy.GetFuelFlowFeePerGallon();
            var fuelFee = Money.Usd(request.FuelGallons * fuelFlowRate.Amount);
            breakdown.Add(new BviaFeeBreakdownItem(
                BviaFeeCategory.FuelFlow,
                $"Fuel Flow Fee ({request.FuelGallons:N0} gallons × ${fuelFlowRate.Amount:F2})",
                fuelFee));
        }

        // Calculate totals
        var totalFee = breakdown.Aggregate(Money.Zero(), (sum, item) => sum.Add(item.Amount));

        return new BviaFeeCalculationResult(
            TotalFee: totalFee,
            LandingFee: landingFee,
            NavigationFee: navigationFee,
            MtowTier: mtowTier.Level,
            Breakdown: breakdown,
            PolicySource: policy.GetPolicySource());
    }

    public Money CalculateLandingFee(decimal mtowLbs, FlightOperationType operationType)
    {
        return CalculateLandingFee(mtowLbs, operationType, _defaultPolicy);
    }

    public Money CalculateLandingFee(decimal mtowLbs, FlightOperationType operationType, IBviaFeePolicy policy)
    {
        if (mtowLbs < 0)
            throw new ArgumentException("MTOW cannot be negative", nameof(mtowLbs));

        // Special handling for exempt operation types
        if (operationType is FlightOperationType.Emergency or FlightOperationType.Military or FlightOperationType.Government)
        {
            return Money.Zero();
        }

        var mtowTier = MtowTier.FromPounds(mtowLbs);

        // Get rate from policy
        var ratePerThousandLbs = policy.GetLandingRate(operationType, mtowTier.Level);

        // Calculate fee: rate per 1000 lbs (or fraction thereof)
        var thousandLbsUnits = Math.Ceiling(mtowLbs / 1000m);
        var calculatedFee = thousandLbsUnits * ratePerThousandLbs.Amount;

        // Apply minimum
        var minimumFee = policy.GetMinimumLandingFee(operationType);
        var finalFee = Math.Max(calculatedFee, minimumFee.Amount);

        return Money.Usd(finalFee);
    }

    public Money CalculateNavigationFee(decimal mtowLbs)
    {
        return CalculateNavigationFee(mtowLbs, _defaultPolicy);
    }

    public Money CalculateNavigationFee(decimal mtowLbs, IBviaFeePolicy policy)
    {
        if (mtowLbs < 0)
            throw new ArgumentException("MTOW cannot be negative", nameof(mtowLbs));

        var mtowTier = MtowTier.FromPounds(mtowLbs);
        return policy.GetNavigationFee(mtowTier.Level);
    }

    public Money CalculateParkingFee(Money landingFee, int eightHourBlocks)
    {
        return CalculateParkingFee(landingFee, eightHourBlocks, _defaultPolicy);
    }

    public Money CalculateParkingFee(Money landingFee, int eightHourBlocks, IBviaFeePolicy policy)
    {
        if (eightHourBlocks <= 0)
            return Money.Zero();

        // Get parking fee percentage from policy
        var parkingPercentage = policy.GetParkingFeePercentage();
        var parkingPerBlock = landingFee.Multiply(parkingPercentage);
        return parkingPerBlock.Multiply(eightHourBlocks);
    }

    public Money CalculatePassengerFees(int passengerCount, BviAirport airport, bool isDeparting)
    {
        return CalculatePassengerFees(passengerCount, airport, isDeparting, isInterisland: false, _defaultPolicy);
    }

    public Money CalculatePassengerFees(int passengerCount, BviAirport airport, bool isDeparting, bool isInterisland, IBviaFeePolicy policy)
    {
        if (passengerCount <= 0)
            return Money.Zero();

        var airportDevFee = policy.GetAirportDevelopmentFee(airport, isInterisland);
        var securityFee = policy.GetSecurityCharge();
        var baggageFee = isDeparting ? policy.GetHoldBaggageScreeningFee() : Money.Zero();

        var perPassengerFee = airportDevFee.Amount + securityFee.Amount + baggageFee.Amount;
        return Money.Usd(passengerCount * perPassengerFee);
    }

    public Money CalculateExtendedOperationsFee(TimeOnly scheduledTime, bool isArrival)
    {
        return CalculateExtendedOperationsFee(scheduledTime, isArrival, _defaultPolicy);
    }

    public Money CalculateExtendedOperationsFee(TimeOnly scheduledTime, bool isArrival, IBviaFeePolicy policy)
    {
        return policy.GetExtendedOperationsFee(scheduledTime.Hour);
    }

    public Money CalculateLightingFee(int hours)
    {
        return CalculateLightingFee(hours, _defaultPolicy);
    }

    public Money CalculateLightingFee(int hours, IBviaFeePolicy policy)
    {
        if (hours <= 0)
            return Money.Zero();

        var ratePerHour = policy.GetLightingFeePerHour();
        return Money.Usd(hours * ratePerHour.Amount);
    }

    public Money CalculateInterest(Money principalAmount, int daysOverdue)
    {
        return CalculateInterest(principalAmount, daysOverdue, _defaultPolicy);
    }

    public Money CalculateInterest(Money principalAmount, int daysOverdue, IBviaFeePolicy policy)
    {
        if (daysOverdue <= 30)
            return Money.Zero();

        // Get interest rate from policy (e.g., 0.015 for 1.5% per month)
        var interestRate = policy.GetLatePaymentInterestRate();

        // Pro-rate by days over 30
        var monthsOverdue = (daysOverdue - 30) / 30.0m;
        var interestAmount = principalAmount.Amount * interestRate * monthsOverdue;

        return Money.Create(Math.Round(interestAmount, 2), principalAmount.Currency);
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
    IReadOnlyList<BviaFeeBreakdownItem> Breakdown,
    string? PolicySource = null);

public sealed record BviaFeeBreakdownItem(
    BviaFeeCategory Category,
    string Description,
    Money Amount);
