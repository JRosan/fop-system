using FluentAssertions;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.ValueObjects;
using Xunit;

namespace FopSystem.Domain.Tests.Aggregates;

public class FeeWaiverTests
{
    [Fact]
    public void Create_ShouldInitializeWithPendingStatus()
    {
        // Arrange & Act
        var waiver = FeeWaiver.Create(
            Guid.NewGuid(),
            WaiverType.Government,
            "Government flight justification",
            "operator@test.com");

        // Assert
        waiver.Status.Should().Be(WaiverStatus.Pending);
        waiver.Type.Should().Be(WaiverType.Government);
        waiver.Reason.Should().Be("Government flight justification");
    }

    [Fact]
    public void Create_ShouldSetRequestedByAndTimestamp()
    {
        // Arrange & Act
        var waiver = FeeWaiver.Create(
            Guid.NewGuid(),
            WaiverType.Humanitarian,
            "Humanitarian mission",
            "operator@test.com");

        // Assert
        waiver.RequestedBy.Should().Be("operator@test.com");
        waiver.RequestedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Create_WithEmptyReason_ShouldThrowException()
    {
        // Arrange & Act
        var action = () => FeeWaiver.Create(
            Guid.NewGuid(),
            WaiverType.Diplomatic,
            "",
            "operator@test.com");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Reason*");
    }

    [Fact]
    public void Create_WithEmptyRequestedBy_ShouldThrowException()
    {
        // Arrange & Act
        var action = () => FeeWaiver.Create(
            Guid.NewGuid(),
            WaiverType.Emergency,
            "Emergency justification",
            "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Requested by*");
    }

    [Fact]
    public void Create_WithEmptyApplicationId_ShouldThrowException()
    {
        // Arrange & Act
        var action = () => FeeWaiver.Create(
            Guid.Empty,
            WaiverType.Military,
            "Military flight",
            "operator@test.com");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Application ID*");
    }

    [Fact]
    public void Approve_ShouldSetApprovedStatus()
    {
        // Arrange
        var waiver = CreatePendingWaiver();
        var waivedAmount = Money.Usd(750m);

        // Act
        waiver.Approve("approver@test.com", waivedAmount, 75m);

        // Assert
        waiver.Status.Should().Be(WaiverStatus.Approved);
        waiver.WaiverPercentage.Should().Be(75m);
        waiver.ApprovedBy.Should().Be("approver@test.com");
        waiver.WaivedAmount.Should().Be(waivedAmount);
        waiver.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_WithFullWaiver_ShouldSet100Percent()
    {
        // Arrange
        var waiver = CreatePendingWaiver();
        var waivedAmount = Money.Usd(1000m);

        // Act
        waiver.Approve("approver@test.com", waivedAmount, 100m);

        // Assert
        waiver.WaiverPercentage.Should().Be(100m);
    }

    [Fact]
    public void Approve_WithInvalidPercentage_ShouldThrowException()
    {
        // Arrange
        var waiver = CreatePendingWaiver();
        var waivedAmount = Money.Usd(1500m);

        // Act
        var action = () => waiver.Approve("approver@test.com", waivedAmount, 150m);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*percentage*");
    }

    [Fact]
    public void Approve_WithNegativePercentage_ShouldThrowException()
    {
        // Arrange
        var waiver = CreatePendingWaiver();
        var waivedAmount = Money.Usd(0m);

        // Act
        var action = () => waiver.Approve("approver@test.com", waivedAmount, -10m);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*percentage*");
    }

    [Fact]
    public void Approve_WhenNotPending_ShouldThrowException()
    {
        // Arrange
        var waiver = CreatePendingWaiver();
        waiver.Approve("approver@test.com", Money.Usd(1000m), 100m);

        // Act
        var action = () => waiver.Approve("another@test.com", Money.Usd(500m), 50m);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot approve waiver*");
    }

    [Fact]
    public void Reject_ShouldSetRejectedStatus()
    {
        // Arrange
        var waiver = CreatePendingWaiver();

        // Act
        waiver.Reject("approver@test.com", "Insufficient documentation");

        // Assert
        waiver.Status.Should().Be(WaiverStatus.Rejected);
        waiver.RejectedBy.Should().Be("approver@test.com");
        waiver.RejectionReason.Should().Be("Insufficient documentation");
        waiver.RejectedAt.Should().NotBeNull();
        waiver.WaiverPercentage.Should().BeNull();
    }

    [Fact]
    public void Reject_WithEmptyReason_ShouldThrowException()
    {
        // Arrange
        var waiver = CreatePendingWaiver();

        // Act
        var action = () => waiver.Reject("approver@test.com", "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*reason*");
    }

    [Fact]
    public void Reject_WhenNotPending_ShouldThrowException()
    {
        // Arrange
        var waiver = CreatePendingWaiver();
        waiver.Reject("approver@test.com", "Rejected first time");

        // Act
        var action = () => waiver.Reject("another@test.com", "Re-reject");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot reject waiver*");
    }

    [Theory]
    [InlineData(WaiverType.Emergency)]
    [InlineData(WaiverType.Humanitarian)]
    [InlineData(WaiverType.Government)]
    [InlineData(WaiverType.Diplomatic)]
    [InlineData(WaiverType.Military)]
    [InlineData(WaiverType.Other)]
    public void Create_ShouldAcceptAllWaiverTypes(WaiverType waiverType)
    {
        // Arrange & Act
        var waiver = FeeWaiver.Create(
            Guid.NewGuid(),
            waiverType,
            $"Justification for {waiverType}",
            "operator@test.com");

        // Assert
        waiver.Type.Should().Be(waiverType);
    }

    private static FeeWaiver CreatePendingWaiver()
    {
        return FeeWaiver.Create(
            Guid.NewGuid(),
            WaiverType.Government,
            "Government flight justification",
            "operator@test.com");
    }
}
