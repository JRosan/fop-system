using FluentAssertions;
using FopSystem.Domain.ValueObjects;
using Xunit;

namespace FopSystem.Domain.Tests.ValueObjects;

public class WeightTests
{
    [Fact]
    public void Create_WithValidKilograms_ShouldSucceed()
    {
        // Arrange & Act
        var weight = Weight.Kilograms(1000m);

        // Assert
        weight.Value.Should().Be(1000m);
        weight.Unit.Should().Be(WeightUnit.KG);
    }

    [Fact]
    public void Create_WithValidPounds_ShouldSucceed()
    {
        // Arrange & Act
        var weight = Weight.Pounds(2204.62m);

        // Assert
        weight.Value.Should().Be(2204.62m);
        weight.Unit.Should().Be(WeightUnit.LBS);
    }

    [Fact]
    public void Create_WithNegativeWeight_ShouldThrowException()
    {
        // Arrange & Act
        var action = () => Weight.Kilograms(-100m);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*cannot be negative*");
    }

    [Fact]
    public void ToKilograms_FromPounds_ShouldConvertCorrectly()
    {
        // Arrange
        var weight = Weight.Pounds(2204.62m);

        // Act
        var kilograms = weight.ToKilograms();

        // Assert
        kilograms.Value.Should().BeApproximately(1000m, 1m);
        kilograms.Unit.Should().Be(WeightUnit.KG);
    }

    [Fact]
    public void ToPounds_FromKilograms_ShouldConvertCorrectly()
    {
        // Arrange
        var weight = Weight.Kilograms(1000m);

        // Act
        var pounds = weight.ToPounds();

        // Assert
        pounds.Value.Should().BeApproximately(2204.62m, 1m);
        pounds.Unit.Should().Be(WeightUnit.LBS);
    }

    [Fact]
    public void InKilograms_ShouldReturnCorrectValue()
    {
        // Arrange
        var weight = Weight.Kilograms(1000m);

        // Act & Assert
        weight.InKilograms.Should().Be(1000m);
    }

    [Fact]
    public void InPounds_ShouldReturnCorrectValue()
    {
        // Arrange
        var weight = Weight.Kilograms(1000m);

        // Act & Assert
        weight.InPounds.Should().BeApproximately(2204.62m, 1m);
    }

    [Fact]
    public void Equals_WithSameKilograms_ShouldReturnTrue()
    {
        // Arrange
        var weight1 = Weight.Kilograms(1000m);
        var weight2 = Weight.Kilograms(1000m);

        // Act & Assert
        weight1.Should().Be(weight2);
    }
}
