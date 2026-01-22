using FluentAssertions;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;
using Xunit;

namespace FopSystem.Domain.Tests.Services;

public class BviaFeeCalculationServiceTests
{
    private readonly BviaFeeCalculationService _service;

    public BviaFeeCalculationServiceTests()
    {
        _service = new BviaFeeCalculationService();
    }

    #region Landing Fee Tests

    [Theory]
    [InlineData(5000, FlightOperationType.LocalScheduled, 15.00)]   // Tier1: 5 * $2.50 = $12.50, but min $15
    [InlineData(10000, FlightOperationType.LocalScheduled, 25.00)]  // Tier1: 10 * $2.50 = $25
    [InlineData(12500, FlightOperationType.LocalScheduled, 32.50)]  // Tier1: 13 * $2.50 = $32.50 (ceiling)
    public void CalculateLandingFee_LocalScheduled_Tier1_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
        result.Currency.Should().Be(Currency.USD);
    }

    [Theory]
    [InlineData(20000, FlightOperationType.LocalScheduled, 60.00)]   // Tier2: 20 * $3.00 = $60
    [InlineData(50000, FlightOperationType.LocalScheduled, 150.00)]  // Tier2: 50 * $3.00 = $150
    [InlineData(75000, FlightOperationType.LocalScheduled, 225.00)]  // Tier2: 75 * $3.00 = $225
    public void CalculateLandingFee_LocalScheduled_Tier2_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(80000, FlightOperationType.LocalScheduled, 280.00)]   // Tier3: 80 * $3.50 = $280
    [InlineData(100000, FlightOperationType.LocalScheduled, 350.00)]  // Tier3: 100 * $3.50 = $350
    public void CalculateLandingFee_LocalScheduled_Tier3_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(150000, FlightOperationType.LocalScheduled, 750.00)]  // Tier4: 150 * $5.00 = $750
    [InlineData(200000, FlightOperationType.LocalScheduled, 1000.00)] // Tier4: 200 * $5.00 = $1000
    public void CalculateLandingFee_LocalScheduled_Tier4_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(5000, FlightOperationType.GeneralAviation, 25.00)]   // Tier1: 5 * $5.00 = $25
    [InlineData(10000, FlightOperationType.GeneralAviation, 50.00)]  // Tier1: 10 * $5.00 = $50
    public void CalculateLandingFee_GeneralAviation_Tier1_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(20000, FlightOperationType.GeneralAviation, 200.00)]  // Tier2: 20 * $10.00 = $200
    [InlineData(50000, FlightOperationType.GeneralAviation, 500.00)]  // Tier2: 50 * $10.00 = $500
    public void CalculateLandingFee_GeneralAviation_Tier2_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(80000, FlightOperationType.GeneralAviation, 960.00)]   // Tier3: 80 * $12.00 = $960
    [InlineData(100000, FlightOperationType.GeneralAviation, 1200.00)] // Tier3: 100 * $12.00 = $1200
    public void CalculateLandingFee_GeneralAviation_Tier3_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(150000, FlightOperationType.GeneralAviation, 2250.00)]  // Tier4: 150 * $15.00 = $2250
    [InlineData(200000, FlightOperationType.GeneralAviation, 3000.00)]  // Tier4: 200 * $15.00 = $3000
    public void CalculateLandingFee_GeneralAviation_Tier4_ShouldCalculateCorrectly(
        decimal mtowLbs, FlightOperationType opType, decimal expectedFee)
    {
        var result = _service.CalculateLandingFee(mtowLbs, opType);

        result.Amount.Should().Be(expectedFee);
    }

    [Fact]
    public void CalculateLandingFee_Interisland_ShouldUseLocalScheduledRates()
    {
        // Interisland uses LocalScheduled rates
        var interislandResult = _service.CalculateLandingFee(50000, FlightOperationType.Interisland);
        var scheduledResult = _service.CalculateLandingFee(50000, FlightOperationType.LocalScheduled);

        interislandResult.Amount.Should().Be(scheduledResult.Amount);
    }

    [Fact]
    public void CalculateLandingFee_Charter_ShouldUseGeneralAviationRates()
    {
        // Charter uses same rates as General Aviation
        var charterResult = _service.CalculateLandingFee(50000, FlightOperationType.Charter);
        var gaResult = _service.CalculateLandingFee(50000, FlightOperationType.GeneralAviation);

        charterResult.Amount.Should().Be(gaResult.Amount);
    }

    [Theory]
    [InlineData(FlightOperationType.Emergency)]
    [InlineData(FlightOperationType.Military)]
    [InlineData(FlightOperationType.Government)]
    public void CalculateLandingFee_ExemptOperations_ShouldReturnZero(FlightOperationType opType)
    {
        var result = _service.CalculateLandingFee(50000, opType);

        result.Amount.Should().Be(0);
    }

    [Fact]
    public void CalculateLandingFee_BelowMinimum_ShouldReturnMinimumFee()
    {
        // 1000 lbs at LocalScheduled: 1 * $2.50 = $2.50, but minimum is $15
        var result = _service.CalculateLandingFee(1000, FlightOperationType.LocalScheduled);

        result.Amount.Should().Be(15.00m);
    }

    [Fact]
    public void CalculateLandingFee_GeneralAviation_BelowMinimum_ShouldReturnMinimumFee()
    {
        // 1000 lbs at GA: 1 * $5.00 = $5.00, but minimum is $20
        var result = _service.CalculateLandingFee(1000, FlightOperationType.GeneralAviation);

        result.Amount.Should().Be(20.00m);
    }

    [Fact]
    public void CalculateLandingFee_NegativeMtow_ShouldThrowException()
    {
        var action = () => _service.CalculateLandingFee(-1000, FlightOperationType.GeneralAviation);

        action.Should().Throw<ArgumentException>()
            .WithMessage("*MTOW cannot be negative*");
    }

    #endregion

    #region Navigation Fee Tests

    [Theory]
    [InlineData(5000, 5.00)]    // Tier1: 0-12,500 lbs = $5
    [InlineData(12500, 5.00)]   // Tier1 upper bound
    public void CalculateNavigationFee_Tier1_ShouldReturn5Dollars(decimal mtowLbs, decimal expectedFee)
    {
        var result = _service.CalculateNavigationFee(mtowLbs);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(12501, 10.00)]  // Tier2: 12,501-75,000 lbs = $10
    [InlineData(50000, 10.00)]
    [InlineData(75000, 10.00)]  // Tier2 upper bound
    public void CalculateNavigationFee_Tier2_ShouldReturn10Dollars(decimal mtowLbs, decimal expectedFee)
    {
        var result = _service.CalculateNavigationFee(mtowLbs);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(75001, 15.00)]   // Tier3: 75,001-100,000 lbs = $15
    [InlineData(90000, 15.00)]
    [InlineData(100000, 15.00)] // Tier3 upper bound
    public void CalculateNavigationFee_Tier3_ShouldReturn15Dollars(decimal mtowLbs, decimal expectedFee)
    {
        var result = _service.CalculateNavigationFee(mtowLbs);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(100001, 20.00)]  // Tier4: Over 100,000 lbs = $20
    [InlineData(150000, 20.00)]
    [InlineData(500000, 20.00)]
    public void CalculateNavigationFee_Tier4_ShouldReturn20Dollars(decimal mtowLbs, decimal expectedFee)
    {
        var result = _service.CalculateNavigationFee(mtowLbs);

        result.Amount.Should().Be(expectedFee);
    }

    [Fact]
    public void CalculateNavigationFee_NegativeMtow_ShouldThrowException()
    {
        var action = () => _service.CalculateNavigationFee(-1000);

        action.Should().Throw<ArgumentException>()
            .WithMessage("*MTOW cannot be negative*");
    }

    #endregion

    #region Parking Fee Tests

    [Fact]
    public void CalculateParkingFee_OneBlock_ShouldReturn20Percent()
    {
        // 20% of $100 landing fee for 1 block = $20
        var landingFee = Money.Usd(100);
        var result = _service.CalculateParkingFee(landingFee, eightHourBlocks: 1);

        result.Amount.Should().Be(20.00m);
    }

    [Fact]
    public void CalculateParkingFee_MultipleBlocks_ShouldMultiply()
    {
        // 20% of $100 landing fee for 3 blocks = $60
        var landingFee = Money.Usd(100);
        var result = _service.CalculateParkingFee(landingFee, eightHourBlocks: 3);

        result.Amount.Should().Be(60.00m);
    }

    [Fact]
    public void CalculateParkingFee_ZeroBlocks_ShouldReturnZero()
    {
        var landingFee = Money.Usd(100);
        var result = _service.CalculateParkingFee(landingFee, eightHourBlocks: 0);

        result.Amount.Should().Be(0);
    }

    [Fact]
    public void CalculateParkingFee_NegativeBlocks_ShouldReturnZero()
    {
        var landingFee = Money.Usd(100);
        var result = _service.CalculateParkingFee(landingFee, eightHourBlocks: -1);

        result.Amount.Should().Be(0);
    }

    #endregion

    #region Passenger Fee Tests

    [Theory]
    [InlineData(BviAirport.TUPJ, 10, 270.00)]  // 10 pax × ($15 + $5 + $7) = $270
    [InlineData(BviAirport.TUPW, 10, 220.00)]  // 10 pax × ($10 + $5 + $7) = $220
    [InlineData(BviAirport.TUPY, 10, 220.00)]  // 10 pax × ($10 + $5 + $7) = $220
    public void CalculatePassengerFees_DepartingPassengers_ShouldIncludeAllFees(
        BviAirport airport, int passengerCount, decimal expectedFee)
    {
        var result = _service.CalculatePassengerFees(passengerCount, airport, isDeparting: true);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(BviAirport.TUPJ, 10, 200.00)]  // 10 pax × ($15 + $5) = $200 (no baggage screening for arriving)
    [InlineData(BviAirport.TUPW, 10, 150.00)]  // 10 pax × ($10 + $5) = $150
    [InlineData(BviAirport.TUPY, 10, 150.00)]  // 10 pax × ($10 + $5) = $150
    public void CalculatePassengerFees_ArrivingPassengers_ShouldExcludeBaggageScreening(
        BviAirport airport, int passengerCount, decimal expectedFee)
    {
        var result = _service.CalculatePassengerFees(passengerCount, airport, isDeparting: false);

        result.Amount.Should().Be(expectedFee);
    }

    [Fact]
    public void CalculatePassengerFees_ZeroPassengers_ShouldReturnZero()
    {
        var result = _service.CalculatePassengerFees(0, BviAirport.TUPJ, isDeparting: true);

        result.Amount.Should().Be(0);
    }

    [Fact]
    public void CalculatePassengerFees_NegativePassengers_ShouldReturnZero()
    {
        var result = _service.CalculatePassengerFees(-5, BviAirport.TUPJ, isDeparting: true);

        result.Amount.Should().Be(0);
    }

    [Fact]
    public void CalculatePassengerFees_TUPJ_ShouldHaveHighestAirportDevelopmentFee()
    {
        // TUPJ (TB Lettsome) has $15/pax, others have $10
        var tupjResult = _service.CalculatePassengerFees(1, BviAirport.TUPJ, isDeparting: true);
        var tupwResult = _service.CalculatePassengerFees(1, BviAirport.TUPW, isDeparting: true);
        var tupyResult = _service.CalculatePassengerFees(1, BviAirport.TUPY, isDeparting: true);

        tupjResult.Amount.Should().BeGreaterThan(tupwResult.Amount);
        tupwResult.Amount.Should().Be(tupyResult.Amount);
    }

    #endregion

    #region Extended Operations Fee Tests

    [Theory]
    [InlineData(4, 0, 975.00)]   // 04:00 - Early operations
    [InlineData(5, 30, 975.00)]  // 05:30 - Still early operations
    public void CalculateExtendedOperationsFee_EarlyMorning_ShouldReturn975(int hour, int minute, decimal expectedFee)
    {
        var time = new TimeOnly(hour, minute);
        var result = _service.CalculateExtendedOperationsFee(time, isArrival: true);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(22, 0, 1650.00)]   // 22:00 - Late operations
    [InlineData(23, 30, 1650.00)]  // 23:30 - Still late operations
    public void CalculateExtendedOperationsFee_LateEvening_ShouldReturn1650(int hour, int minute, decimal expectedFee)
    {
        var time = new TimeOnly(hour, minute);
        var result = _service.CalculateExtendedOperationsFee(time, isArrival: true);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(0, 0, 3225.00)]   // 00:00 - Very late operations
    [InlineData(1, 30, 3225.00)]  // 01:30 - Still very late
    public void CalculateExtendedOperationsFee_AfterMidnight_ShouldReturn3225(int hour, int minute, decimal expectedFee)
    {
        var time = new TimeOnly(hour, minute);
        var result = _service.CalculateExtendedOperationsFee(time, isArrival: true);

        result.Amount.Should().Be(expectedFee);
    }

    [Theory]
    [InlineData(6, 0)]    // 06:00 - Standard hours begin
    [InlineData(12, 0)]   // 12:00 - Midday
    [InlineData(18, 0)]   // 18:00 - Evening
    [InlineData(21, 59)]  // 21:59 - Just before late ops
    public void CalculateExtendedOperationsFee_StandardHours_ShouldReturnZero(int hour, int minute)
    {
        var time = new TimeOnly(hour, minute);
        var result = _service.CalculateExtendedOperationsFee(time, isArrival: true);

        result.Amount.Should().Be(0);
    }

    #endregion

    #region Lighting Fee Tests

    [Theory]
    [InlineData(1, 35.00)]   // 1 hour × $35 = $35
    [InlineData(2, 70.00)]   // 2 hours × $35 = $70
    [InlineData(3, 105.00)]  // 3 hours × $35 = $105
    public void CalculateLightingFee_ShouldMultiplyByHours(int hours, decimal expectedFee)
    {
        var result = _service.CalculateLightingFee(hours);

        result.Amount.Should().Be(expectedFee);
    }

    [Fact]
    public void CalculateLightingFee_ZeroHours_ShouldReturnZero()
    {
        var result = _service.CalculateLightingFee(0);

        result.Amount.Should().Be(0);
    }

    [Fact]
    public void CalculateLightingFee_NegativeHours_ShouldReturnZero()
    {
        var result = _service.CalculateLightingFee(-1);

        result.Amount.Should().Be(0);
    }

    #endregion

    #region Interest Calculation Tests

    [Fact]
    public void CalculateInterest_Under30Days_ShouldReturnZero()
    {
        var principal = Money.Usd(1000);
        var result = _service.CalculateInterest(principal, daysOverdue: 25);

        result.Amount.Should().Be(0);
    }

    [Fact]
    public void CalculateInterest_Exactly30Days_ShouldReturnZero()
    {
        var principal = Money.Usd(1000);
        var result = _service.CalculateInterest(principal, daysOverdue: 30);

        result.Amount.Should().Be(0);
    }

    [Fact]
    public void CalculateInterest_60Days_ShouldReturn1Point5Percent()
    {
        // 60 days overdue = 30 days after grace period = 1 month
        // 1.5% of $1000 = $15
        var principal = Money.Usd(1000);
        var result = _service.CalculateInterest(principal, daysOverdue: 60);

        result.Amount.Should().Be(15.00m);
    }

    [Fact]
    public void CalculateInterest_90Days_ShouldReturn3Percent()
    {
        // 90 days overdue = 60 days after grace period = 2 months
        // 3% of $1000 = $30
        var principal = Money.Usd(1000);
        var result = _service.CalculateInterest(principal, daysOverdue: 90);

        result.Amount.Should().Be(30.00m);
    }

    [Fact]
    public void CalculateInterest_45Days_ShouldProRate()
    {
        // 45 days overdue = 15 days after grace period = 0.5 months
        // 0.75% of $1000 = $7.50
        var principal = Money.Usd(1000);
        var result = _service.CalculateInterest(principal, daysOverdue: 45);

        result.Amount.Should().Be(7.50m);
    }

    [Fact]
    public void CalculateInterest_ShouldPreserveCurrency()
    {
        var principal = Money.Usd(1000);
        var result = _service.CalculateInterest(principal, daysOverdue: 60);

        result.Currency.Should().Be(Currency.USD);
    }

    #endregion

    #region Full Calculation Tests

    [Fact]
    public void Calculate_BasicRequest_ShouldReturnCorrectTotal()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 50000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 10);

        var result = _service.Calculate(request);

        // Landing: 50 × $10 = $500
        // Navigation: Tier2 = $10
        // Airport Dev: 10 × $15 = $150
        // Security: 10 × $5 = $50
        // Baggage Screening: 10 × $7 = $70
        // Total: $780
        result.TotalFee.Amount.Should().Be(780.00m);
        result.LandingFee.Amount.Should().Be(500.00m);
        result.NavigationFee.Amount.Should().Be(10.00m);
        result.MtowTier.Should().Be(MtowTierLevel.Tier2);
    }

    [Fact]
    public void Calculate_WithParking_ShouldIncludeParkingFee()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 50000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 0,
            ParkingHours: 16); // 2 eight-hour blocks

        var result = _service.Calculate(request);

        // Landing: $500
        // Navigation: $10
        // Parking: 2 × 20% × $500 = $200
        // Total: $710
        result.TotalFee.Amount.Should().Be(710.00m);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.Parking);
    }

    [Fact]
    public void Calculate_WithCatViFire_ShouldIncludeUpgradeFee()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 50000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 0,
            RequiresCatViFire: true);

        var result = _service.Calculate(request);

        // Landing: $500
        // Navigation: $10
        // CAT-VI: $100
        // Total: $610
        result.TotalFee.Amount.Should().Be(610.00m);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.CatViFireUpgrade);
    }

    [Fact]
    public void Calculate_WithFlightPlanFiling_ShouldIncludeFilingFee()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 50000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 0,
            IncludeFlightPlanFiling: true);

        var result = _service.Calculate(request);

        // Landing: $500
        // Navigation: $10
        // Flight Plan Filing: $20
        // Total: $530
        result.TotalFee.Amount.Should().Be(530.00m);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.FlightPlanFiling);
    }

    [Fact]
    public void Calculate_WithFuel_ShouldIncludeFuelFlowFee()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 50000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 0,
            FuelGallons: 500);

        var result = _service.Calculate(request);

        // Landing: $500
        // Navigation: $10
        // Fuel Flow: 500 × $0.20 = $100
        // Total: $610
        result.TotalFee.Amount.Should().Be(610.00m);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.FuelFlow);
    }

    [Fact]
    public void Calculate_Interisland_ShouldUseLowerAirportDevFee()
    {
        var regularRequest = new BviaFeeCalculationRequest(
            MtowLbs: 10000,
            OperationType: FlightOperationType.LocalScheduled,
            Airport: BviAirport.TUPJ,
            PassengerCount: 10,
            IsInterisland: false);

        var interislandRequest = new BviaFeeCalculationRequest(
            MtowLbs: 10000,
            OperationType: FlightOperationType.LocalScheduled,
            Airport: BviAirport.TUPJ,
            PassengerCount: 10,
            IsInterisland: true);

        var regularResult = _service.Calculate(regularRequest);
        var interislandResult = _service.Calculate(interislandRequest);

        // Interisland should have lower airport dev fee ($5 vs $15)
        interislandResult.TotalFee.Amount.Should().BeLessThan(regularResult.TotalFee.Amount);
    }

    [Fact]
    public void Calculate_ShouldReturnBreakdownItems()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 50000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 10);

        var result = _service.Calculate(request);

        result.Breakdown.Should().NotBeEmpty();
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.Landing);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.Navigation);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.AirportDevelopment);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.Security);
        result.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.HoldBaggageScreening);
    }

    [Fact]
    public void Calculate_NoPassengers_ShouldExcludePassengerFees()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 50000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 0);

        var result = _service.Calculate(request);

        result.Breakdown.Should().NotContain(b => b.Category == BviaFeeCategory.AirportDevelopment);
        result.Breakdown.Should().NotContain(b => b.Category == BviaFeeCategory.Security);
        result.Breakdown.Should().NotContain(b => b.Category == BviaFeeCategory.HoldBaggageScreening);
    }

    [Fact]
    public void Calculate_SmallAircraft_ShouldUseTier1Rates()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 5000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 0);

        var result = _service.Calculate(request);

        result.MtowTier.Should().Be(MtowTierLevel.Tier1);
        result.NavigationFee.Amount.Should().Be(5.00m); // Tier1 nav fee
    }

    [Fact]
    public void Calculate_LargeAircraft_ShouldUseTier4Rates()
    {
        var request = new BviaFeeCalculationRequest(
            MtowLbs: 150000,
            OperationType: FlightOperationType.GeneralAviation,
            Airport: BviAirport.TUPJ,
            PassengerCount: 0);

        var result = _service.Calculate(request);

        result.MtowTier.Should().Be(MtowTierLevel.Tier4);
        result.NavigationFee.Amount.Should().Be(20.00m); // Tier4 nav fee
        result.LandingFee.Amount.Should().Be(2250.00m);  // 150 × $15
    }

    #endregion
}
