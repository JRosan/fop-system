using FluentAssertions;
using FopSystem.Application.Applications.Commands;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Applications;

public class OverrideFeeCommandHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly OverrideFeeCommandHandler _handler;

    public OverrideFeeCommandHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _handler = new OverrideFeeCommandHandler(_applicationRepository);
    }

    [Fact]
    public async Task Handle_WithValidOverride_ShouldSucceed()
    {
        // Arrange
        var application = CreateValidApplication();
        var command = new OverrideFeeCommand(
            application.Id,
            500m,
            Currency.USD,
            "reviewer@test.com",
            "Government flight - 50% discount applied as per policy");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.OriginalFee.Amount.Should().Be(1000m);
        result.Value.NewFee.Amount.Should().Be(500m);
    }

    [Fact]
    public async Task Handle_WithNonExistentApplication_ShouldReturnNotFound()
    {
        // Arrange
        var command = new OverrideFeeCommand(
            Guid.NewGuid(),
            500m,
            Currency.USD,
            "reviewer@test.com",
            "Justification for the fee override");

        _applicationRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((FopApplication?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Error.NotFound");
    }

    [Fact]
    public async Task Handle_ShouldReturnCorrectOverrideDetails()
    {
        // Arrange
        var application = CreateValidApplication();
        var command = new OverrideFeeCommand(
            application.Id,
            750m,
            Currency.USD,
            "reviewer@test.com",
            "Partial discount applied for humanitarian mission");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.OverriddenBy.Should().Be("reviewer@test.com");
        result.Value.Justification.Should().Be("Partial discount applied for humanitarian mission");
        result.Value.OverriddenAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    private static FopApplication CreateValidApplication()
    {
        var flightDetails = FlightDetails.Create(
            FlightPurpose.Charter,
            "TUPJ",
            "TNCM",
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            numberOfPassengers: 100);

        return FopApplication.Create(
            ApplicationType.OneTime,
            Guid.NewGuid(),
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            Money.Usd(1000m));
    }
}
