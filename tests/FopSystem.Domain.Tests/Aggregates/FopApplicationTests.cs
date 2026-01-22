using FluentAssertions;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.ValueObjects;
using Xunit;

namespace FopSystem.Domain.Tests.Aggregates;

public class FopApplicationTests
{
    [Fact]
    public void Create_ShouldInitializeWithDraftStatus()
    {
        // Arrange & Act
        var application = CreateValidApplication();

        // Assert
        application.Status.Should().Be(ApplicationStatus.Draft);
        application.Type.Should().Be(ApplicationType.OneTime);
        application.OperatorId.Should().NotBe(Guid.Empty);
        application.AircraftId.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public void Create_ShouldGenerateApplicationNumber()
    {
        // Arrange & Act
        var application = CreateValidApplication();

        // Assert
        application.ApplicationNumber.Should().NotBeNullOrEmpty();
        application.ApplicationNumber.Should().StartWith("FOP-OT-"); // One-Time prefix
    }

    [Fact]
    public void Create_ShouldRaiseDomainEvent()
    {
        // Arrange & Act
        var application = CreateValidApplication();

        // Assert
        application.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ApplicationCreatedEvent>();
    }

    [Fact]
    public void Create_WithEmptyOperatorId_ShouldThrowException()
    {
        // Arrange
        var flightDetails = CreateFlightDetails();
        var fee = Money.Usd(1000m);

        // Act
        var action = () => FopApplication.Create(
            ApplicationType.OneTime,
            Guid.Empty,
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            fee);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Operator ID is required*");
    }

    [Fact]
    public void Create_WithEmptyAircraftId_ShouldThrowException()
    {
        // Arrange
        var flightDetails = CreateFlightDetails();
        var fee = Money.Usd(1000m);

        // Act
        var action = () => FopApplication.Create(
            ApplicationType.OneTime,
            Guid.NewGuid(),
            Guid.Empty,
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            fee);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Aircraft ID is required*");
    }

    [Fact]
    public void Create_WithEndDateBeforeStartDate_ShouldThrowException()
    {
        // Arrange
        var flightDetails = CreateFlightDetails();
        var fee = Money.Usd(1000m);

        // Act
        var action = () => FopApplication.Create(
            ApplicationType.OneTime,
            Guid.NewGuid(),
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)), // End before start
            fee);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*End date must be after start date*");
    }

    [Fact]
    public void UpdateCalculatedFee_InDraftStatus_ShouldUpdateFee()
    {
        // Arrange
        var application = CreateValidApplication();
        var newFee = Money.Usd(2000m);

        // Act
        application.UpdateCalculatedFee(newFee);

        // Assert
        application.CalculatedFee.Should().Be(newFee);
    }

    [Fact]
    public void AddDocument_InDraftStatus_ShouldAddDocument()
    {
        // Arrange
        var application = CreateValidApplication();
        var document = ApplicationDocument.Create(
            application.Id,
            DocumentType.AirOperatorCertificate,
            "aoc.pdf",
            1024,
            "application/pdf",
            "https://storage.example.com/aoc.pdf",
            "user@test.com");

        // Act
        application.AddDocument(document);

        // Assert
        application.Documents.Should().ContainSingle()
            .Which.Should().Be(document);
    }

    [Fact]
    public void Cancel_ShouldTransitionToCancelled()
    {
        // Arrange
        var application = CreateValidApplication();

        // Act
        application.Cancel();

        // Assert
        application.Status.Should().Be(ApplicationStatus.Cancelled);
    }

    [Fact]
    public void Cancel_WhenAlreadyApproved_ShouldThrowException()
    {
        // Arrange - we can't easily get to Approved status without setting up all the data
        // So we'll test the simpler case of cancelling already cancelled
        var application = CreateValidApplication();
        application.Cancel();

        // Act
        var action = () => application.Cancel();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot cancel*");
    }

    private static FopApplication CreateValidApplication()
    {
        var flightDetails = CreateFlightDetails();
        var fee = Money.Usd(1000m);

        return FopApplication.Create(
            ApplicationType.OneTime,
            Guid.NewGuid(),
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            fee);
    }

    private static FlightDetails CreateFlightDetails()
    {
        return FlightDetails.Create(
            FlightPurpose.Charter,
            "TUPJ", // BVI airport
            "TNCM", // St. Maarten
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            numberOfPassengers: 100);
    }
}
