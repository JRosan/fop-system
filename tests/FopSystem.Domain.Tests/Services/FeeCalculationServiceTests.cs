using FluentAssertions;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;
using Xunit;

namespace FopSystem.Domain.Tests.Services;

public class FeeCalculationServiceTests
{
    private readonly FeeCalculationService _service;

    public FeeCalculationServiceTests()
    {
        _service = new FeeCalculationService();
    }

    [Fact]
    public void Calculate_OneTimePermit_ShouldApplyCorrectMultiplier()
    {
        // Arrange
        var seats = 100;
        var mtowKg = 50000m;

        // Act
        var result = _service.Calculate(ApplicationType.OneTime, seats, mtowKg);

        // Assert
        // Formula: (150 + (100 * 10) + (50000 * 0.02)) * 1.0 = (150 + 1000 + 1000) * 1.0 = 2150
        result.TotalFee.Amount.Should().Be(2150m);
        result.TotalFee.Currency.Should().Be(Currency.USD);
        result.Multiplier.Should().Be(1.0m);
    }

    [Fact]
    public void Calculate_BlanketPermit_ShouldApply2Point5Multiplier()
    {
        // Arrange
        var seats = 100;
        var mtowKg = 50000m;

        // Act
        var result = _service.Calculate(ApplicationType.Blanket, seats, mtowKg);

        // Assert
        // Formula: (150 + (100 * 10) + (50000 * 0.02)) * 2.5 = (150 + 1000 + 1000) * 2.5 = 5375
        result.TotalFee.Amount.Should().Be(5375m);
        result.Multiplier.Should().Be(2.5m);
    }

    [Fact]
    public void Calculate_EmergencyPermit_ShouldApply0Point5Multiplier()
    {
        // Arrange
        var seats = 100;
        var mtowKg = 50000m;

        // Act
        var result = _service.Calculate(ApplicationType.Emergency, seats, mtowKg);

        // Assert
        // Formula: (150 + (100 * 10) + (50000 * 0.02)) * 0.5 = (150 + 1000 + 1000) * 0.5 = 1075
        result.TotalFee.Amount.Should().Be(1075m);
        result.Multiplier.Should().Be(0.5m);
    }

    [Fact]
    public void Calculate_WithZeroSeats_ShouldCalculateCorrectly()
    {
        // Arrange - Cargo aircraft with no seats
        var seats = 0;
        var mtowKg = 50000m;

        // Act
        var result = _service.Calculate(ApplicationType.OneTime, seats, mtowKg);

        // Assert
        // Formula: (150 + (0 * 10) + (50000 * 0.02)) * 1.0 = (150 + 0 + 1000) * 1.0 = 1150
        result.TotalFee.Amount.Should().Be(1150m);
        result.SeatFee.Amount.Should().Be(0m);
    }

    [Fact]
    public void Calculate_SmallAircraft_ShouldCalculateCorrectly()
    {
        // Arrange - Small twin engine aircraft
        var seats = 9;
        var mtowKg = 5700m;

        // Act
        var result = _service.Calculate(ApplicationType.OneTime, seats, mtowKg);

        // Assert
        // Formula: (150 + (9 * 10) + (5700 * 0.02)) * 1.0 = (150 + 90 + 114) * 1.0 = 354
        result.TotalFee.Amount.Should().Be(354m);
    }

    [Fact]
    public void Calculate_ShouldReturnFeeBreakdown()
    {
        // Arrange
        var seats = 100;
        var mtowKg = 50000m;

        // Act
        var result = _service.Calculate(ApplicationType.OneTime, seats, mtowKg);

        // Assert
        result.BaseFee.Amount.Should().Be(150m);
        result.SeatFee.Amount.Should().Be(1000m);    // 100 * 10
        result.WeightFee.Amount.Should().Be(1000m);  // 50000 * 0.02
        result.Breakdown.Should().NotBeEmpty();
    }

    [Fact]
    public void Calculate_WithNegativeSeats_ShouldThrowException()
    {
        // Arrange & Act
        var action = () => _service.Calculate(ApplicationType.OneTime, -1, 50000m);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Seat count cannot be negative*");
    }

    [Fact]
    public void Calculate_WithNegativeMtow_ShouldThrowException()
    {
        // Arrange & Act
        var action = () => _service.Calculate(ApplicationType.OneTime, 100, -1m);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*MTOW cannot be negative*");
    }
}
