using FluentAssertions;
using FopSystem.Application.Payments.Commands;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Payments;

public class RefundPaymentCommandHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly RefundPaymentCommandHandler _handler;

    public RefundPaymentCommandHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _handler = new RefundPaymentCommandHandler(_applicationRepository);
    }

    [Fact]
    public async Task Handle_WithValidPayment_ShouldRefundSuccessfully()
    {
        // Arrange
        var application = CreateApplicationWithPayment();
        var command = new RefundPaymentCommand(
            application.Id,
            "admin@test.com",
            "Customer requested refund");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.RefundedAmount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Handle_WithNonExistentApplication_ShouldReturnNotFoundError()
    {
        // Arrange
        var command = new RefundPaymentCommand(
            Guid.NewGuid(),
            "admin@test.com",
            "Refund reason");

        _applicationRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((FopApplication?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Error.NotFound");
    }

    [Fact]
    public async Task Handle_WithNoPayment_ShouldReturnPaymentNotFoundError()
    {
        // Arrange
        var application = CreateValidApplication();
        var command = new RefundPaymentCommand(
            application.Id,
            "admin@test.com",
            "Refund reason");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Payment.NotFound");
    }

    private static FopApplication CreateApplicationWithPayment()
    {
        var application = CreateValidApplication();

        // Submit and process payment
        application.Submit();
        application.RequestPayment(PaymentMethod.CreditCard);
        application.CompletePayment("TXN-123", "RCP-123");

        return application;
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
