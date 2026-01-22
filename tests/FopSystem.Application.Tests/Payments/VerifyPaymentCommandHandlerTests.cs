using FluentAssertions;
using FopSystem.Application.Payments.Commands;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Payments;

public class VerifyPaymentCommandHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly VerifyPaymentCommandHandler _handler;

    public VerifyPaymentCommandHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _handler = new VerifyPaymentCommandHandler(_applicationRepository);
    }

    [Fact]
    public async Task Handle_WithCompletedPayment_ShouldVerifySuccessfully()
    {
        // Arrange
        var application = CreateApplicationWithCompletedPayment();
        var command = new VerifyPaymentCommand(
            application.Id,
            "finance@test.com",
            "Payment receipt confirmed");

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        application.Payment!.IsVerified.Should().BeTrue();
        application.Payment.VerifiedBy.Should().Be("finance@test.com");
        application.Payment.VerificationNotes.Should().Be("Payment receipt confirmed");
    }

    [Fact]
    public async Task Handle_WithNonExistentApplication_ShouldReturnNotFoundError()
    {
        // Arrange
        var command = new VerifyPaymentCommand(
            Guid.NewGuid(),
            "finance@test.com",
            null);

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
        var command = new VerifyPaymentCommand(
            application.Id,
            "finance@test.com",
            null);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Payment.NotFound");
    }

    [Fact]
    public async Task Handle_WithPendingPayment_ShouldReturnInvalidOperationError()
    {
        // Arrange
        var application = CreateApplicationWithPendingPayment();
        var command = new VerifyPaymentCommand(
            application.Id,
            "finance@test.com",
            null);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Payment.InvalidOperation");
        result.Error.Message.Should().Contain("Pending");
    }

    [Fact]
    public async Task Handle_WithAlreadyVerifiedPayment_ShouldReturnInvalidOperationError()
    {
        // Arrange
        var application = CreateApplicationWithVerifiedPayment();
        var command = new VerifyPaymentCommand(
            application.Id,
            "finance2@test.com",
            null);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error!.Code.Should().Be("Payment.InvalidOperation");
        result.Error.Message.Should().Contain("already been verified");
    }

    private static FopApplication CreateApplicationWithCompletedPayment()
    {
        var application = CreateValidApplication();
        AddRequiredDocuments(application);
        application.Submit();
        application.StartReview("reviewer-001");
        VerifyAllDocuments(application);
        application.RequestPayment(PaymentMethod.CreditCard);
        application.CompletePayment("TXN-123", "RCP-123");
        return application;
    }

    private static FopApplication CreateApplicationWithPendingPayment()
    {
        var application = CreateValidApplication();
        AddRequiredDocuments(application);
        application.Submit();
        application.StartReview("reviewer-001");
        VerifyAllDocuments(application);
        application.RequestPayment(PaymentMethod.CreditCard);
        return application;
    }

    private static FopApplication CreateApplicationWithVerifiedPayment()
    {
        var application = CreateApplicationWithCompletedPayment();
        application.Payment!.Verify("finance@test.com", "Initial verification");
        return application;
    }

    private static void AddRequiredDocuments(FopApplication application)
    {
        var requiredDocTypes = new[]
        {
            DocumentType.CertificateOfAirworthiness,
            DocumentType.CertificateOfRegistration,
            DocumentType.AirOperatorCertificate,
            DocumentType.InsuranceCertificate
        };

        foreach (var docType in requiredDocTypes)
        {
            var document = ApplicationDocument.Create(
                application.Id,
                docType,
                $"{docType}.pdf",
                1024,
                "application/pdf",
                $"https://storage.test/docs/{docType}.pdf",
                "test-user",
                DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)));
            application.AddDocument(document);
        }
    }

    private static void VerifyAllDocuments(FopApplication application)
    {
        foreach (var doc in application.Documents)
        {
            application.VerifyDocument(doc.Id, "reviewer-001");
        }
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
