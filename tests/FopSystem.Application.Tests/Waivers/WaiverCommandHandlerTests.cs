using FluentAssertions;
using FopSystem.Application.Waivers.Commands;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Waivers;

public class RequestWaiverCommandHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly RequestWaiverCommandHandler _handler;

    public RequestWaiverCommandHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _handler = new RequestWaiverCommandHandler(_applicationRepository);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ShouldCreateWaiver()
    {
        // Arrange
        var application = CreateValidApplication();
        var command = new RequestWaiverCommand(
            application.Id,
            WaiverType.Government,
            "Government medical evacuation flight",
            "operator@test.com");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Status.Should().Be("Pending");
    }

    [Fact]
    public async Task Handle_WithNonExistentApplication_ShouldReturnNotFound()
    {
        // Arrange
        var command = new RequestWaiverCommand(
            Guid.NewGuid(),
            WaiverType.Humanitarian,
            "Justification for waiver",
            "operator@test.com");

        _applicationRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((FopApplication?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Error.NotFound");
    }

    [Theory]
    [InlineData(WaiverType.Emergency)]
    [InlineData(WaiverType.Humanitarian)]
    [InlineData(WaiverType.Government)]
    [InlineData(WaiverType.Diplomatic)]
    [InlineData(WaiverType.Military)]
    [InlineData(WaiverType.Other)]
    public async Task Handle_ShouldAcceptAllWaiverTypes(WaiverType waiverType)
    {
        // Arrange
        var application = CreateValidApplication();
        var command = new RequestWaiverCommand(
            application.Id,
            waiverType,
            $"Justification for {waiverType} waiver type",
            "operator@test.com");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
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

public class ApproveWaiverCommandHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly ApproveWaiverCommandHandler _handler;

    public ApproveWaiverCommandHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _handler = new ApproveWaiverCommandHandler(_applicationRepository);
    }

    [Fact]
    public async Task Handle_WithValidApproval_ShouldApproveWaiver()
    {
        // Arrange
        var application = CreateApplicationWithPendingWaiver();
        var waiverId = application.Waivers.First().Id;
        var command = new ApproveWaiverCommand(
            application.Id,
            waiverId,
            "approver@test.com",
            100m); // 100% waiver

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.WaiverPercentage.Should().Be(100m);
    }

    [Fact]
    public async Task Handle_WithPartialWaiver_ShouldSetCorrectPercentage()
    {
        // Arrange
        var application = CreateApplicationWithPendingWaiver();
        var waiverId = application.Waivers.First().Id;
        var command = new ApproveWaiverCommand(
            application.Id,
            waiverId,
            "approver@test.com",
            50m); // 50% waiver

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.WaiverPercentage.Should().Be(50m);
    }

    [Fact]
    public async Task Handle_WithNonExistentApplication_ShouldReturnNotFound()
    {
        // Arrange
        var command = new ApproveWaiverCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "approver@test.com",
            100m);

        _applicationRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((FopApplication?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Error.NotFound");
    }

    private static FopApplication CreateApplicationWithPendingWaiver()
    {
        var flightDetails = FlightDetails.Create(
            FlightPurpose.Charter,
            "TUPJ",
            "TNCM",
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            numberOfPassengers: 100);

        var application = FopApplication.Create(
            ApplicationType.OneTime,
            Guid.NewGuid(),
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            Money.Usd(1000m));

        application.RequestWaiver(WaiverType.Government, "Government flight", "operator@test.com");
        return application;
    }
}

public class RejectWaiverCommandHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly RejectWaiverCommandHandler _handler;

    public RejectWaiverCommandHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _handler = new RejectWaiverCommandHandler(_applicationRepository);
    }

    [Fact]
    public async Task Handle_WithValidRejection_ShouldRejectWaiver()
    {
        // Arrange
        var application = CreateApplicationWithPendingWaiver();
        var waiverId = application.Waivers.First().Id;
        var command = new RejectWaiverCommand(
            application.Id,
            waiverId,
            "approver@test.com",
            "Insufficient documentation provided for this waiver request");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WithNonExistentApplication_ShouldReturnNotFound()
    {
        // Arrange
        var command = new RejectWaiverCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "approver@test.com",
            "Reason for rejection with sufficient detail");

        _applicationRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((FopApplication?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Error.NotFound");
    }

    private static FopApplication CreateApplicationWithPendingWaiver()
    {
        var flightDetails = FlightDetails.Create(
            FlightPurpose.Charter,
            "TUPJ",
            "TNCM",
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            numberOfPassengers: 100);

        var application = FopApplication.Create(
            ApplicationType.OneTime,
            Guid.NewGuid(),
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            Money.Usd(1000m));

        application.RequestWaiver(WaiverType.Humanitarian, "Humanitarian mission", "operator@test.com");
        return application;
    }
}
