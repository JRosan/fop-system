using FluentAssertions;
using FopSystem.Domain.ValueObjects;
using Xunit;

namespace FopSystem.Domain.Tests.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Create_WithValidAmount_ShouldSucceed()
    {
        // Arrange & Act
        var money = Money.Create(100.00m, Currency.USD);

        // Assert
        money.Amount.Should().Be(100.00m);
        money.Currency.Should().Be(Currency.USD);
    }

    [Fact]
    public void Create_WithNegativeAmount_ShouldThrowException()
    {
        // Arrange & Act
        var action = () => Money.Create(-100.00m, Currency.USD);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*cannot be negative*");
    }

    [Fact]
    public void Usd_ShouldCreateUsdMoney()
    {
        // Arrange & Act
        var money = Money.Usd(100.00m);

        // Assert
        money.Amount.Should().Be(100.00m);
        money.Currency.Should().Be(Currency.USD);
    }

    [Fact]
    public void Xcd_ShouldCreateXcdMoney()
    {
        // Arrange & Act
        var money = Money.Xcd(100.00m);

        // Assert
        money.Amount.Should().Be(100.00m);
        money.Currency.Should().Be(Currency.XCD);
    }

    [Fact]
    public void Add_WithSameCurrency_ShouldReturnSum()
    {
        // Arrange
        var money1 = Money.Create(100.00m, Currency.USD);
        var money2 = Money.Create(50.00m, Currency.USD);

        // Act
        var result = money1.Add(money2);

        // Assert
        result.Amount.Should().Be(150.00m);
        result.Currency.Should().Be(Currency.USD);
    }

    [Fact]
    public void Add_WithDifferentCurrency_ShouldThrowException()
    {
        // Arrange
        var money1 = Money.Create(100.00m, Currency.USD);
        var money2 = Money.Create(50.00m, Currency.XCD);

        // Act
        var action = () => money1.Add(money2);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*different currencies*");
    }

    [Fact]
    public void Multiply_ShouldReturnMultipliedAmount()
    {
        // Arrange
        var money = Money.Create(100.00m, Currency.USD);

        // Act
        var result = money.Multiply(2.5m);

        // Assert
        result.Amount.Should().Be(250.00m);
        result.Currency.Should().Be(Currency.USD);
    }

    [Fact]
    public void Equals_WithSameValues_ShouldReturnTrue()
    {
        // Arrange
        var money1 = Money.Create(100.00m, Currency.USD);
        var money2 = Money.Create(100.00m, Currency.USD);

        // Act & Assert
        money1.Should().Be(money2);
    }

    [Fact]
    public void Zero_ShouldReturnZeroAmount()
    {
        // Act
        var money = Money.Zero(Currency.USD);

        // Assert
        money.Amount.Should().Be(0m);
        money.Currency.Should().Be(Currency.USD);
    }

    [Fact]
    public void OperatorPlus_ShouldAddMoney()
    {
        // Arrange
        var money1 = Money.Usd(100m);
        var money2 = Money.Usd(50m);

        // Act
        var result = money1 + money2;

        // Assert
        result.Amount.Should().Be(150m);
    }

    [Fact]
    public void OperatorMultiply_ShouldMultiplyMoney()
    {
        // Arrange
        var money = Money.Usd(100m);

        // Act
        var result = money * 2.5m;

        // Assert
        result.Amount.Should().Be(250m);
    }
}
