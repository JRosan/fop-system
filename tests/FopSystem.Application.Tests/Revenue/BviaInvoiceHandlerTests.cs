using FluentAssertions;
using FopSystem.Application.Interfaces;
using FopSystem.Application.Revenue.EventHandlers;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Revenue;

public class BviaInvoiceHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IAircraftRepository _aircraftRepository;
    private readonly IBviaInvoiceRepository _invoiceRepository;
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IBviaFeeCalculationService _feeCalculationService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ApplicationSubmittedBviaInvoiceHandler> _logger;
    private readonly ApplicationSubmittedBviaInvoiceHandler _handler;

    public BviaInvoiceHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _aircraftRepository = Substitute.For<IAircraftRepository>();
        _invoiceRepository = Substitute.For<IBviaInvoiceRepository>();
        _accountBalanceRepository = Substitute.For<IOperatorAccountBalanceRepository>();
        _feeCalculationService = Substitute.For<IBviaFeeCalculationService>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<ApplicationSubmittedBviaInvoiceHandler>>();

        _handler = new ApplicationSubmittedBviaInvoiceHandler(
            _applicationRepository,
            _aircraftRepository,
            _invoiceRepository,
            _accountBalanceRepository,
            _feeCalculationService,
            _unitOfWork,
            _logger);
    }

    [Fact]
    public async Task Handle_WhenApplicationSubmitted_ShouldCreateBviaInvoice()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var aircraft = CreateAircraft(application.AircraftId);
        var feeResult = CreateFeeCalculationResult();

        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _feeCalculationService.Calculate(Arg.Any<BviaFeeCalculationRequest>())
            .Returns(feeResult);
        _accountBalanceRepository.GetOrCreateAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(OperatorAccountBalance.Create(application.OperatorId));

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _invoiceRepository.Received(1).AddAsync(
            Arg.Is<BviaInvoice>(inv =>
                inv.OperatorId == application.OperatorId &&
                inv.FopApplicationId == application.Id),
            Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenApplicationNotFound_ShouldNotCreateInvoice()
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
        await _invoiceRepository.DidNotReceive().AddAsync(
            Arg.Any<BviaInvoice>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenAircraftNotFound_ShouldNotCreateInvoice()
    {
        // Arrange
        var application = CreateSubmittedApplication();

        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns((Domain.Aggregates.Aircraft.Aircraft?)null);

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _invoiceRepository.DidNotReceive().AddAsync(
            Arg.Any<BviaInvoice>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldCalculateFeesBasedOnAircraftWeight()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var aircraft = CreateAircraft(application.AircraftId, mtowKg: 25000m); // ~55,000 lbs
        var feeResult = CreateFeeCalculationResult(totalFee: 800m);

        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _feeCalculationService.Calculate(Arg.Any<BviaFeeCalculationRequest>())
            .Returns(feeResult);
        _accountBalanceRepository.GetOrCreateAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(OperatorAccountBalance.Create(application.OperatorId));

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        _feeCalculationService.Received(1).Calculate(
            Arg.Is<BviaFeeCalculationRequest>(req =>
                req.MtowLbs > 50000m)); // Should convert KG to LBS
    }

    [Fact]
    public async Task Handle_ShouldSetCorrectFlightDate()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var aircraft = CreateAircraft(application.AircraftId);
        var feeResult = CreateFeeCalculationResult();

        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _feeCalculationService.Calculate(Arg.Any<BviaFeeCalculationRequest>())
            .Returns(feeResult);
        _accountBalanceRepository.GetOrCreateAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(OperatorAccountBalance.Create(application.OperatorId));

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _invoiceRepository.Received(1).AddAsync(
            Arg.Is<BviaInvoice>(inv =>
                inv.FlightDate == application.FlightDetails.EstimatedFlightDate),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldAddLineItemsFromFeeCalculation()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var aircraft = CreateAircraft(application.AircraftId);
        var feeResult = CreateFeeCalculationResult();

        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _feeCalculationService.Calculate(Arg.Any<BviaFeeCalculationRequest>())
            .Returns(feeResult);
        _accountBalanceRepository.GetOrCreateAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(OperatorAccountBalance.Create(application.OperatorId));

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert - Invoice should have line items matching the fee breakdown
        await _invoiceRepository.Received(1).AddAsync(
            Arg.Is<BviaInvoice>(inv => inv.LineItems.Count == feeResult.Breakdown.Count),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldEnsureOperatorAccountBalanceExists()
    {
        // Arrange
        var application = CreateSubmittedApplication();
        var aircraft = CreateAircraft(application.AircraftId);
        var feeResult = CreateFeeCalculationResult();

        var notification = new ApplicationSubmittedEvent(
            application.Id,
            application.ApplicationNumber,
            application.CalculatedFee);

        _applicationRepository.GetByIdAsync(application.Id, Arg.Any<CancellationToken>())
            .Returns(application);
        _aircraftRepository.GetByIdAsync(application.AircraftId, Arg.Any<CancellationToken>())
            .Returns(aircraft);
        _feeCalculationService.Calculate(Arg.Any<BviaFeeCalculationRequest>())
            .Returns(feeResult);
        _accountBalanceRepository.GetOrCreateAsync(application.OperatorId, Arg.Any<CancellationToken>())
            .Returns(OperatorAccountBalance.Create(application.OperatorId));

        // Act
        await _handler.Handle(notification, CancellationToken.None);

        // Assert
        await _accountBalanceRepository.Received(1).GetOrCreateAsync(
            application.OperatorId,
            Arg.Any<CancellationToken>());
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

    private static Domain.Aggregates.Aircraft.Aircraft CreateAircraft(Guid id, decimal mtowKg = 22680m)
    {
        var weight = Weight.Kilograms(mtowKg);
        return Domain.Aggregates.Aircraft.Aircraft.Create(
            registrationMark: "VP-BVI",
            manufacturer: "Boeing",
            model: "737-800",
            serialNumber: "12345",
            category: AircraftCategory.FixedWing,
            mtow: weight,
            seatCount: 189,
            yearOfManufacture: 2020,
            operatorId: Guid.NewGuid());
    }

    private static BviaFeeCalculationResult CreateFeeCalculationResult(decimal totalFee = 500m)
    {
        return new BviaFeeCalculationResult(
            TotalFee: Money.Usd(totalFee),
            LandingFee: Money.Usd(400m),
            NavigationFee: Money.Usd(10m),
            MtowTier: MtowTierLevel.Tier2,
            Breakdown: new List<BviaFeeBreakdownItem>
            {
                new(BviaFeeCategory.Landing, "Landing Fee", Money.Usd(400m)),
                new(BviaFeeCategory.Navigation, "Navigation Fee", Money.Usd(10m)),
                new(BviaFeeCategory.AirportDevelopment, "Airport Development", Money.Usd(90m))
            });
    }
}
