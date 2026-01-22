using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FopSystem.Domain.Enums;
using Xunit;

namespace FopSystem.Api.Tests.Endpoints;

public class FeeEndpointTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public FeeEndpointTests(TestWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CalculateFee_WithValidRequest_ShouldReturnFeeBreakdown()
    {
        // Arrange - Use correct property names matching CalculateFeeRequest
        var request = new
        {
            Type = ApplicationType.OneTime,
            SeatCount = 100,
            MtowKg = 50000m
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<FeeCalculationResponse>();
        content.Should().NotBeNull();
        // Formula: 150 + (100 * 10) + (50000 * 0.02) = 150 + 1000 + 1000 = 2150
        content!.TotalFee.Amount.Should().Be(2150m);
        content.TotalFee.Currency.Should().Be("USD");
    }

    [Fact]
    public async Task CalculateFee_BlanketPermit_ShouldApplyMultiplier()
    {
        // Arrange
        var request = new
        {
            Type = ApplicationType.Blanket,
            SeatCount = 100,
            MtowKg = 50000m
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<FeeCalculationResponse>();
        content.Should().NotBeNull();
        // Formula: (150 + 1000 + 1000) * 2.5 = 5375
        content!.TotalFee.Amount.Should().Be(5375m);
    }

    [Fact]
    public async Task CalculateFee_EmergencyPermit_ShouldApplyDiscount()
    {
        // Arrange
        var request = new
        {
            Type = ApplicationType.Emergency,
            SeatCount = 100,
            MtowKg = 50000m
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/fees/calculate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<FeeCalculationResponse>();
        content.Should().NotBeNull();
        // Formula: (150 + 1000 + 1000) * 0.5 = 1075
        content!.TotalFee.Amount.Should().Be(1075m);
    }

    private record MoneyDto(decimal Amount, string Currency);

    private record FeeCalculationResponse(
        MoneyDto BaseFee,
        MoneyDto SeatFee,
        MoneyDto WeightFee,
        decimal Multiplier,
        MoneyDto TotalFee);
}
