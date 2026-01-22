using FluentAssertions;
using FopSystem.Application.Applications.Commands;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Applications;

public class ApproveApplicationDebtCheckTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IAircraftRepository _aircraftRepository;
    private readonly IPermitRepository _permitRepository;
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IAviationRevenueEngine _revenueEngine;
    private readonly ApproveApplicationCommandHandler _handler;

    public ApproveApplicationDebtCheckTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _operatorRepository = Substitute.For<IOperatorRepository>();
        _aircraftRepository = Substitute.For<IAircraftRepository>();
        _permitRepository = Substitute.For<IPermitRepository>();
        _accountBalanceRepository = Substitute.For<IOperatorAccountBalanceRepository>();
        _revenueEngine = Substitute.For<IAviationRevenueEngine>();

        _handler = new ApproveApplicationCommandHandler(
            _applicationRepository,
            _operatorRepository,
            _aircraftRepository,
            _permitRepository,
            _accountBalanceRepository,
            _revenueEngine);
    }

    [Fact]
    public async Task Handle_WhenOperatorHasOutstandingDebt_ShouldBlockPermitIssuance()
    {
        // Arrange
        var application = CreateApprovedApplication();
        var @operator = CreateOperator();
        var aircraft = CreateAircraft(application.AircraftId);
        var accountBalance = OperatorAccountBalance.Create(application.OperatorId);

        // Simulate overdue debt
        var eligibility = new PermitIssuanceEligibility(
            IsEligible: false,
            OutstandingDebt: Money.Usd(5000m),
            OverdueInvoiceCount: 2,
            BlockReasons: new[] { "Outstanding debt of $5,000.00" });

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _accountBalanceRepository.GetByOperatorIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(accountBalance);
        _revenueEngine.CheckPermitIssuanceEligibility(Arg.Any<Money>(), Arg.Any<int>())
            .Returns(eligibility);

        var command = new ApproveApplicationCommand(application.Id, "approver@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Permit.BlockedDueToDebt");
        result.Error.Message.Should().Contain("Outstanding BVIAA debt");
        result.Error.Message.Should().Contain("5000");
    }

    [Fact]
    public async Task Handle_WhenOperatorHasNoDebt_ShouldIssuePermit()
    {
        // Arrange
        var application = CreateApprovedApplication();
        var @operator = CreateOperator();
        var aircraft = CreateAircraft(application.AircraftId);
        var accountBalance = OperatorAccountBalance.Create(application.OperatorId);

        var eligibility = new PermitIssuanceEligibility(
            IsEligible: true,
            OutstandingDebt: Money.Usd(0m),
            OverdueInvoiceCount: 0,
            BlockReasons: Array.Empty<string>());

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _accountBalanceRepository.GetByOperatorIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(accountBalance);
        _revenueEngine.CheckPermitIssuanceEligibility(Arg.Any<Money>(), Arg.Any<int>())
            .Returns(eligibility);

        var command = new ApproveApplicationCommand(application.Id, "approver@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _permitRepository.Received(1).AddAsync(Arg.Any<Domain.Aggregates.Permit.Permit>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenBypassDebtCheckIsTrue_ShouldIssuePermitDespiteDebt()
    {
        // Arrange
        var application = CreateApprovedApplication();
        var @operator = CreateOperator();
        var aircraft = CreateAircraft(application.AircraftId);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);

        var command = new ApproveApplicationCommand(
            application.Id,
            "approver@test.com",
            Notes: "Approved with debt bypass per authorization",
            BypassDebtCheck: true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        // Should not check debt when bypass is true
        await _accountBalanceRepository.DidNotReceive().GetByOperatorIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        _revenueEngine.DidNotReceive().CheckPermitIssuanceEligibility(Arg.Any<Money>(), Arg.Any<int>());
    }

    [Fact]
    public async Task Handle_WhenNoAccountBalanceExists_ShouldIssuePermit()
    {
        // Arrange
        var application = CreateApprovedApplication();
        var @operator = CreateOperator();
        var aircraft = CreateAircraft(application.AircraftId);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _operatorRepository.GetByIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(@operator);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _accountBalanceRepository.GetByOperatorIdAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns((OperatorAccountBalance?)null);

        var command = new ApproveApplicationCommand(application.Id, "approver@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _permitRepository.Received(1).AddAsync(Arg.Any<Domain.Aggregates.Permit.Permit>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenApplicationNotFound_ShouldReturnNotFound()
    {
        // Arrange
        _applicationRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((FopApplication?)null);

        var command = new ApproveApplicationCommand(Guid.NewGuid(), "approver@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Contain("NotFound");
    }

    private static FopApplication CreateApprovedApplication()
    {
        var flightDetails = FlightDetails.Create(
            FlightPurpose.Charter,
            "TUPJ",
            "TNCM",
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            numberOfPassengers: 50);

        var application = FopApplication.Create(
            ApplicationType.OneTime,
            Guid.NewGuid(),
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            Money.Usd(500m));

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
        application.StartReview("reviewer@test.com");

        // Verify all documents so payment can be requested
        foreach (var doc in application.Documents)
        {
            application.VerifyDocument(doc.Id, "reviewer@test.com");
        }

        // Request and complete payment (required before approval)
        application.RequestPayment(PaymentMethod.BankTransfer);
        application.CompletePayment("TXN-12345", "RCP-12345");

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

    private static Domain.Aggregates.Aircraft.Aircraft CreateAircraft(Guid operatorId)
    {
        var weight = Weight.Kilograms(22680m);
        return Domain.Aggregates.Aircraft.Aircraft.Create(
            registrationMark: "VP-BVI",
            manufacturer: "Boeing",
            model: "737-800",
            serialNumber: "12345",
            category: AircraftCategory.FixedWing,
            mtow: weight,
            seatCount: 189,
            yearOfManufacture: 2020,
            operatorId: operatorId);
    }
}
