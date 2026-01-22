using FluentAssertions;
using FopSystem.Application.EventHandlers;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.EventHandlers;

public class ApplicationSubmittedEventHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IEmailService _emailService;
    private readonly IOfficerNotificationService _officerNotificationService;
    private readonly ILogger<ApplicationSubmittedEventHandler> _logger;
    private readonly ApplicationSubmittedEventHandler _handler;

    public ApplicationSubmittedEventHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _operatorRepository = Substitute.For<IOperatorRepository>();
        _emailService = Substitute.For<IEmailService>();
        _officerNotificationService = Substitute.For<IOfficerNotificationService>();
        _logger = Substitute.For<ILogger<ApplicationSubmittedEventHandler>>();

        _handler = new ApplicationSubmittedEventHandler(
            _applicationRepository,
            _operatorRepository,
            _emailService,
            _officerNotificationService,
            _logger);
    }

    [Fact]
    public async Task Handle_ShouldSendConfirmationEmailToOperator()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var @operator = CreateOperator();
        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _officerNotificationService.GetReviewerEmailsAsync(Arg.Any<CancellationToken>())
            .Returns(new List<string> { "reviewer@test.com" });

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _emailService.Received(1).SendApplicationSubmittedEmailAsync(
            @operator.ContactInfo.Email,
            application.ApplicationNumber,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldSendNotificationToReviewers()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var @operator = CreateOperator();
        var reviewerEmails = new List<string> { "reviewer1@test.com", "reviewer2@test.com" };
        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _officerNotificationService.GetReviewerEmailsAsync(Arg.Any<CancellationToken>())
            .Returns(reviewerEmails);

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _emailService.Received(1).SendOfficerNewApplicationNotificationAsync(
            Arg.Is<IEnumerable<string>>(emails => emails.Count() == 2),
            application.ApplicationNumber,
            application.Type.ToString(),
            @operator.Name,
            application.CalculatedFee.Amount,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenApplicationNotFound_ShouldNotSendEmails()
    {
        // Arrange
        var notification = new ApplicationSubmittedEvent(
            Guid.NewGuid(),
            "FOP-OT-12345",
            Money.Usd(1000m));

        _applicationRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((FopApplication?)null);

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _emailService.DidNotReceive().SendApplicationSubmittedEmailAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenOperatorNotFound_ShouldNotSendEmails()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns((Operator?)null);

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _emailService.DidNotReceive().SendApplicationSubmittedEmailAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenNoReviewersConfigured_ShouldSkipOfficerNotification()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var @operator = CreateOperator();
        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _officerNotificationService.GetReviewerEmailsAsync(Arg.Any<CancellationToken>())
            .Returns(new List<string>()); // No reviewers

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _emailService.Received(1).SendApplicationSubmittedEmailAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
        await _emailService.DidNotReceive().SendOfficerNewApplicationNotificationAsync(
            Arg.Any<IEnumerable<string>>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<decimal>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenEmailServiceThrows_ShouldNotRethrow()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var @operator = CreateOperator();
        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _emailService.SendApplicationSubmittedEmailAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>())
            .Returns(Task.FromException(new Exception("SMTP Error")));

        // Act
        var action = async () => await _handler.Handle(notification, CancellationToken.None);

        // Assert - Should not throw
        await action.Should().NotThrowAsync();
    }

    private static FopApplication CreateSubmittedApplication()
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

        // Add required documents before submission
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

        application.Submit();
        return application;
    }

    private static Operator CreateOperator()
    {
        var address = Address.Create(
            "123 Main St",
            "Road Town",
            "Tortola",
            "VG1110",
            "British Virgin Islands");

        var contactInfo = ContactInfo.Create(
            "contact@testairlines.com",
            "+1234567890",
            "Test Airlines HQ");

        var authorizedRep = AuthorizedRepresentative.Create(
            "John Doe",
            "CEO",
            "john.doe@testairlines.com",
            "+1234567891");

        return Operator.Create(
            "Test Airlines",
            "REG-12345",
            "BVI",
            address,
            contactInfo,
            authorizedRep,
            "AOC-12345",
            "BVI CAA",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)));
    }
}
