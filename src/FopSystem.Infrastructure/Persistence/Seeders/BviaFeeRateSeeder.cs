using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FopSystem.Infrastructure.Persistence.Seeders;

public class BviaFeeRateSeeder
{
    private readonly FopDbContext _context;
    private readonly ILogger<BviaFeeRateSeeder> _logger;
    private static readonly DateOnly EffectiveDate = new(2025, 1, 1);

    public BviaFeeRateSeeder(FopDbContext context, ILogger<BviaFeeRateSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _context.BviaFeeRates.AnyAsync(cancellationToken))
        {
            _logger.LogInformation("BVIAA fee rates already seeded, skipping");
            return;
        }

        _logger.LogInformation("Seeding BVIAA fee rates...");

        var rates = new List<BviaFeeRate>();

        // Landing Fees
        rates.AddRange(CreateLandingFeeRates());

        // Navigation Fees
        rates.AddRange(CreateNavigationFeeRates());

        // Parking Fees
        rates.AddRange(CreateParkingFeeRates());

        // Passenger-Based Fees
        rates.AddRange(CreatePassengerFeeRates());

        // Operations Fees
        rates.AddRange(CreateOperationsFeeRates());

        // Other Fees
        rates.AddRange(CreateOtherFeeRates());

        await _context.BviaFeeRates.AddRangeAsync(rates, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Seeded {Count} BVIAA fee rates", rates.Count);
    }

    private IEnumerable<BviaFeeRate> CreateLandingFeeRates()
    {
        var rates = new List<BviaFeeRate>();

        // Local/Scheduled Operations Landing Fees
        // Tier 1: 0-12,500 lbs - $2.50 per 1000 lbs, min $15
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.LocalScheduled,
            Money.Usd(2.50m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier1,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for scheduled operations - 0-12,500 lbs"));

        // Tier 2: 12,501-75,000 lbs - $3.00 per 1000 lbs, min $15
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.LocalScheduled,
            Money.Usd(3.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier2,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for scheduled operations - 12,501-75,000 lbs"));

        // Tier 3: 75,001-100,000 lbs - $3.50 per 1000 lbs, min $15
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.LocalScheduled,
            Money.Usd(3.50m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier3,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for scheduled operations - 75,001-100,000 lbs"));

        // Tier 4: Over 100,000 lbs - $5.00 per 1000 lbs, min $15
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.LocalScheduled,
            Money.Usd(5.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier4,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for scheduled operations - Over 100,000 lbs"));

        // General Aviation Landing Fees
        // Tier 1: 0-12,500 lbs - $5.00 per 1000 lbs, min $20
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.GeneralAviation,
            Money.Usd(5.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier1,
            minimumFee: Money.Usd(20m),
            description: "Landing fee for general aviation - 0-12,500 lbs"));

        // Tier 2: 12,501-75,000 lbs - $10.00 per 1000 lbs, min $20
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.GeneralAviation,
            Money.Usd(10.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier2,
            minimumFee: Money.Usd(20m),
            description: "Landing fee for general aviation - 12,501-75,000 lbs"));

        // Tier 3: 75,001-100,000 lbs - $12.00 per 1000 lbs, min $20
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.GeneralAviation,
            Money.Usd(12.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier3,
            minimumFee: Money.Usd(20m),
            description: "Landing fee for general aviation - 75,001-100,000 lbs"));

        // Tier 4: Over 100,000 lbs - $15.00 per 1000 lbs, min $20
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.GeneralAviation,
            Money.Usd(15.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier4,
            minimumFee: Money.Usd(20m),
            description: "Landing fee for general aviation - Over 100,000 lbs"));

        // Interisland Landing Fees (same as Local/Scheduled)
        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.Interisland,
            Money.Usd(2.50m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier1,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for interisland operations - 0-12,500 lbs"));

        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.Interisland,
            Money.Usd(3.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier2,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for interisland operations - 12,501-75,000 lbs"));

        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.Interisland,
            Money.Usd(3.50m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier3,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for interisland operations - 75,001-100,000 lbs"));

        rates.Add(BviaFeeRate.Create(
            BviaFeeCategory.Landing,
            FlightOperationType.Interisland,
            Money.Usd(5.00m),
            isPerUnit: true,
            unitDescription: "per 1,000 lbs MTOW",
            EffectiveDate,
            mtowTier: MtowTierLevel.Tier4,
            minimumFee: Money.Usd(15m),
            description: "Landing fee for interisland operations - Over 100,000 lbs"));

        return rates;
    }

    private IEnumerable<BviaFeeRate> CreateNavigationFeeRates()
    {
        var rates = new List<BviaFeeRate>();
        var operationTypes = new[] { FlightOperationType.LocalScheduled, FlightOperationType.GeneralAviation, FlightOperationType.Interisland };

        foreach (var opType in operationTypes)
        {
            // Tier 1: 0-12,500 lbs - $5 flat
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.Navigation,
                opType,
                Money.Usd(5m),
                isPerUnit: false,
                unitDescription: null,
                EffectiveDate,
                mtowTier: MtowTierLevel.Tier1,
                description: "Navigation/Communication fee - 0-12,500 lbs"));

            // Tier 2: 12,501-75,000 lbs - $10 flat
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.Navigation,
                opType,
                Money.Usd(10m),
                isPerUnit: false,
                unitDescription: null,
                EffectiveDate,
                mtowTier: MtowTierLevel.Tier2,
                description: "Navigation/Communication fee - 12,501-75,000 lbs"));

            // Tier 3: 75,001-100,000 lbs - $15 flat
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.Navigation,
                opType,
                Money.Usd(15m),
                isPerUnit: false,
                unitDescription: null,
                EffectiveDate,
                mtowTier: MtowTierLevel.Tier3,
                description: "Navigation/Communication fee - 75,001-100,000 lbs"));

            // Tier 4: Over 100,000 lbs - $20 flat
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.Navigation,
                opType,
                Money.Usd(20m),
                isPerUnit: false,
                unitDescription: null,
                EffectiveDate,
                mtowTier: MtowTierLevel.Tier4,
                description: "Navigation/Communication fee - Over 100,000 lbs"));
        }

        return rates;
    }

    private IEnumerable<BviaFeeRate> CreateParkingFeeRates()
    {
        var rates = new List<BviaFeeRate>();
        var operationTypes = new[] { FlightOperationType.LocalScheduled, FlightOperationType.GeneralAviation, FlightOperationType.Interisland };

        // Parking fee is 20% of landing fee per 8-hour block
        // We'll store the percentage rate and calculate at runtime
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.Parking,
                opType,
                Money.Usd(0.20m), // 20% as decimal
                isPerUnit: true,
                unitDescription: "20% of landing fee per 8-hour block",
                EffectiveDate,
                description: "Parking/Ramp fee - 20% of landing fee per 8-hour block"));
        }

        return rates;
    }

    private IEnumerable<BviaFeeRate> CreatePassengerFeeRates()
    {
        var rates = new List<BviaFeeRate>();
        var operationTypes = new[] { FlightOperationType.LocalScheduled, FlightOperationType.GeneralAviation };

        // Airport Development Fees by Airport
        // TB Lettsome (TUPJ): $15 per passenger
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.AirportDevelopment,
                opType,
                Money.Usd(15m),
                isPerUnit: true,
                unitDescription: "per passenger",
                EffectiveDate,
                airport: BviAirport.TUPJ,
                description: "Airport Development Fee - TB Lettsome International"));
        }

        // Virgin Gorda (TUPW): $10 per passenger
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.AirportDevelopment,
                opType,
                Money.Usd(10m),
                isPerUnit: true,
                unitDescription: "per passenger",
                EffectiveDate,
                airport: BviAirport.TUPW,
                description: "Airport Development Fee - Virgin Gorda"));
        }

        // Anegada (TUPY): $10 per passenger
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.AirportDevelopment,
                opType,
                Money.Usd(10m),
                isPerUnit: true,
                unitDescription: "per passenger",
                EffectiveDate,
                airport: BviAirport.TUPY,
                description: "Airport Development Fee - Anegada"));
        }

        // Interisland: $5 per passenger (all airports)
        foreach (var airport in new[] { BviAirport.TUPJ, BviAirport.TUPW, BviAirport.TUPY })
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.AirportDevelopment,
                FlightOperationType.Interisland,
                Money.Usd(5m),
                isPerUnit: true,
                unitDescription: "per passenger",
                EffectiveDate,
                airport: airport,
                description: "Airport Development Fee - Interisland"));
        }

        // Security Charge: $5 per passenger (all airports, all operation types)
        var allOperationTypes = new[] { FlightOperationType.LocalScheduled, FlightOperationType.GeneralAviation, FlightOperationType.Interisland };
        foreach (var airport in new[] { BviAirport.TUPJ, BviAirport.TUPW, BviAirport.TUPY })
        {
            foreach (var opType in allOperationTypes)
            {
                rates.Add(BviaFeeRate.Create(
                    BviaFeeCategory.Security,
                    opType,
                    Money.Usd(5m),
                    isPerUnit: true,
                    unitDescription: "per passenger",
                    EffectiveDate,
                    airport: airport,
                    description: "Security Charge"));
            }
        }

        // Hold Baggage Screening: $7 per departing passenger (all airports, all operation types)
        foreach (var airport in new[] { BviAirport.TUPJ, BviAirport.TUPW, BviAirport.TUPY })
        {
            foreach (var opType in allOperationTypes)
            {
                rates.Add(BviaFeeRate.Create(
                    BviaFeeCategory.HoldBaggageScreening,
                    opType,
                    Money.Usd(7m),
                    isPerUnit: true,
                    unitDescription: "per departing passenger",
                    EffectiveDate,
                    airport: airport,
                    description: "Hold Baggage Screening Fee"));
            }
        }

        return rates;
    }

    private IEnumerable<BviaFeeRate> CreateOperationsFeeRates()
    {
        var rates = new List<BviaFeeRate>();
        var operationTypes = new[] { FlightOperationType.LocalScheduled, FlightOperationType.GeneralAviation, FlightOperationType.Interisland };

        // Extended Operations Fee - placeholder rates
        // Actual extended ops fees are complex ($975-$3,225+ based on hours and staff)
        // We'll create base rates that can be used for calculation
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.ExtendedOperations,
                opType,
                Money.Usd(975m),
                isPerUnit: false,
                unitDescription: "base fee for operations outside standard hours",
                EffectiveDate,
                description: "Extended/Early Operations Fee - Base Rate"));
        }

        // Lighting Fee: $35 per hour (23:00-02:00 GMT)
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.Lighting,
                opType,
                Money.Usd(35m),
                isPerUnit: true,
                unitDescription: "per hour",
                EffectiveDate,
                description: "Lighting Fee (23:00-02:00 GMT)"));
        }

        // Flight Plan Filing: $20 flat
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.FlightPlanFiling,
                opType,
                Money.Usd(20m),
                isPerUnit: false,
                unitDescription: null,
                EffectiveDate,
                description: "Flight Plan Filing Fee"));
        }

        // CAT-VI Fire Upgrade: $100 flat (for larger aircraft like G-5s, Globals)
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.CatViFireUpgrade,
                opType,
                Money.Usd(100m),
                isPerUnit: false,
                unitDescription: null,
                EffectiveDate,
                description: "CAT-VI Fire Service Upgrade Fee"));
        }

        return rates;
    }

    private IEnumerable<BviaFeeRate> CreateOtherFeeRates()
    {
        var rates = new List<BviaFeeRate>();
        var operationTypes = new[] { FlightOperationType.LocalScheduled, FlightOperationType.GeneralAviation, FlightOperationType.Interisland };

        // Fuel Flow Fee: $0.20 per gallon
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.FuelFlow,
                opType,
                Money.Usd(0.20m),
                isPerUnit: true,
                unitDescription: "per gallon",
                EffectiveDate,
                description: "Fuel Flow Fee"));
        }

        // Late Payment Interest: 1.5% per month
        // Stored as decimal for calculation (0.015)
        foreach (var opType in operationTypes)
        {
            rates.Add(BviaFeeRate.Create(
                BviaFeeCategory.LatePaymentInterest,
                opType,
                Money.Usd(0.015m), // 1.5% as decimal
                isPerUnit: true,
                unitDescription: "1.5% per month on outstanding balance",
                EffectiveDate,
                description: "Late Payment Interest Rate (1.5%/month after 30 days)"));
        }

        return rates;
    }
}
