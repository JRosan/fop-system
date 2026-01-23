using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using FopSystem.Domain.Enums;
using Xunit;

namespace FopSystem.Api.Tests.Endpoints;

public class BviaFeeEndpointTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public BviaFeeEndpointTests(TestWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    #region Calculate BVIAA Fees Endpoint

    [Fact]
    public async Task CalculateBviaFees_WithValidRequest_ShouldReturnFeeBreakdown()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 50000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 10
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        content!.TotalFee.Amount.Should().Be(780.00m); // Landing + Nav + Pax fees
        content.LandingFee.Amount.Should().Be(500.00m); // 50 × $10
        content.NavigationFee.Amount.Should().Be(10.00m); // Tier2
        content.MtowTier.Should().Be("Tier2");
        content.Breakdown.Should().HaveCountGreaterThanOrEqualTo(5);
    }

    [Fact]
    public async Task CalculateBviaFees_SmallAircraft_ShouldUseTier1Rates()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 5000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 0
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        content!.MtowTier.Should().Be("Tier1");
        content.NavigationFee.Amount.Should().Be(5.00m); // Tier1 nav fee
        content.LandingFee.Amount.Should().Be(25.00m); // 5 × $5
    }

    [Fact]
    public async Task CalculateBviaFees_LargeAircraft_ShouldUseTier4Rates()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 150000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 0
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        content!.MtowTier.Should().Be("Tier4");
        content.NavigationFee.Amount.Should().Be(20.00m); // Tier4 nav fee
        content.LandingFee.Amount.Should().Be(2250.00m); // 150 × $15
    }

    [Fact]
    public async Task CalculateBviaFees_LocalScheduled_ShouldUseLowerRates()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 50000m,
            OperationType = (int)FlightOperationType.LocalScheduled,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 0
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        content!.LandingFee.Amount.Should().Be(150.00m); // 50 × $3 (LocalScheduled Tier2)
    }

    [Fact]
    public async Task CalculateBviaFees_WithParking_ShouldIncludeParkingFee()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 50000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 0,
            ParkingHours = 16 // 2 eight-hour blocks
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        // Landing: $500, Nav: $10, Parking: 2 × 20% × $500 = $200
        content!.TotalFee.Amount.Should().Be(710.00m);
        content.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.Parking);
    }

    [Fact]
    public async Task CalculateBviaFees_WithCatViFire_ShouldIncludeUpgradeFee()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 50000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 0,
            RequiresCatViFire = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        // Landing: $500, Nav: $10, CAT-VI: $100
        content!.TotalFee.Amount.Should().Be(610.00m);
        content.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.CatViFireUpgrade);
    }

    [Fact]
    public async Task CalculateBviaFees_WithFlightPlanFiling_ShouldIncludeFilingFee()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 50000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 0,
            IncludeFlightPlanFiling = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        // Landing: $500, Nav: $10, Filing: $20
        content!.TotalFee.Amount.Should().Be(530.00m);
        content.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.FlightPlanFiling);
    }

    [Fact]
    public async Task CalculateBviaFees_WithFuel_ShouldIncludeFuelFlowFee()
    {
        // Arrange
        var request = new
        {
            MtowLbs = 50000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 0,
            FuelGallons = 500m
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        // Landing: $500, Nav: $10, Fuel: 500 × $0.20 = $100
        content!.TotalFee.Amount.Should().Be(610.00m);
        content.Breakdown.Should().Contain(b => b.Category == BviaFeeCategory.FuelFlow);
    }

    [Fact]
    public async Task CalculateBviaFees_DifferentAirports_ShouldHaveDifferentAirportDevFees()
    {
        // TUPJ: $15/pax, TUPW/TUPY: $10/pax
        var tupjRequest = new
        {
            MtowLbs = 10000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            PassengerCount = 10
        };

        var tupwRequest = new
        {
            MtowLbs = 10000m,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPW,
            PassengerCount = 10
        };

        // Act
        var tupjResponse = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", tupjRequest);
        var tupwResponse = await _client.PostAsJsonAsync("/api/bvia/fees/calculate", tupwRequest);

        // Assert
        tupjResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        tupwResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var tupjContent = await tupjResponse.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);
        var tupwContent = await tupwResponse.Content.ReadFromJsonAsync<BviaFeeCalculationResponse>(JsonOptions);

        // TUPJ should have higher fees due to higher airport dev fee
        tupjContent!.TotalFee.Amount.Should().BeGreaterThan(tupwContent!.TotalFee.Amount);
    }

    #endregion

    #region Calculate Unified Fees Endpoint

    [Fact]
    public async Task CalculateUnifiedFees_ShouldReturnBothFopAndBviaFees()
    {
        // Arrange
        var request = new
        {
            ApplicationType = (int)ApplicationType.OneTime,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            SeatCount = 50,
            MtowKg = 22680m, // ~50,000 lbs
            PassengerCount = 10
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bvia/fees/calculate-unified", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<UnifiedFeeCalculationResponse>(JsonOptions);
        content.Should().NotBeNull();
        content!.FopFees.Amount.Should().BeGreaterThan(0);
        content.BviaFees.Amount.Should().BeGreaterThan(0);
        content.GrandTotal.Amount.Should().Be(content.FopFees.Amount + content.BviaFees.Amount);
        content.FopBreakdown.Should().NotBeEmpty();
        content.BviaBreakdown.Should().NotBeEmpty();
        content.UnifiedBreakdown.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CalculateUnifiedFees_BlanketPermit_ShouldApplyFopMultiplier()
    {
        // Arrange
        var oneTimeRequest = new
        {
            ApplicationType = (int)ApplicationType.OneTime,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            SeatCount = 50,
            MtowKg = 22680m,
            PassengerCount = 0
        };

        var blanketRequest = new
        {
            ApplicationType = (int)ApplicationType.Blanket,
            OperationType = (int)FlightOperationType.GeneralAviation,
            Airport = (int)BviAirport.TUPJ,
            SeatCount = 50,
            MtowKg = 22680m,
            PassengerCount = 0
        };

        // Act
        var oneTimeResponse = await _client.PostAsJsonAsync("/api/bvia/fees/calculate-unified", oneTimeRequest);
        var blanketResponse = await _client.PostAsJsonAsync("/api/bvia/fees/calculate-unified", blanketRequest);

        // Assert
        var oneTimeContent = await oneTimeResponse.Content.ReadFromJsonAsync<UnifiedFeeCalculationResponse>(JsonOptions);
        var blanketContent = await blanketResponse.Content.ReadFromJsonAsync<UnifiedFeeCalculationResponse>(JsonOptions);

        // Blanket should have higher FOP fees (2.5x multiplier)
        blanketContent!.FopFees.Amount.Should().BeGreaterThan(oneTimeContent!.FopFees.Amount);
        // BVIA fees should be the same (not affected by permit type)
        blanketContent.BviaFees.Amount.Should().Be(oneTimeContent.BviaFees.Amount);
    }

    #endregion

    #region DTOs

    private record MoneyDto(decimal Amount, string Currency);

    private record BviaFeeBreakdownItemDto(BviaFeeCategory Category, string Description, MoneyDto Amount);

    private record BviaFeeCalculationResponse(
        MoneyDto TotalFee,
        MoneyDto LandingFee,
        MoneyDto NavigationFee,
        string MtowTier,
        List<BviaFeeBreakdownItemDto> Breakdown);

    private record FopBreakdownItemDto(string Description, MoneyDto Amount);

    private record UnifiedBreakdownItemDto(string Source, string Category, string Description, MoneyDto Amount);

    private record UnifiedFeeCalculationResponse(
        MoneyDto FopFees,
        MoneyDto BviaFees,
        MoneyDto GrandTotal,
        List<FopBreakdownItemDto> FopBreakdown,
        List<BviaFeeBreakdownItemDto> BviaBreakdown,
        List<UnifiedBreakdownItemDto> UnifiedBreakdown);

    #endregion
}
