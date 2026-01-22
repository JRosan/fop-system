using FluentAssertions;
using FopSystem.Application.Reports.Queries;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Reports;

public class GetReconciliationReportQueryHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly GetReconciliationReportQueryHandler _handler;

    public GetReconciliationReportQueryHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _operatorRepository = Substitute.For<IOperatorRepository>();
        _handler = new GetReconciliationReportQueryHandler(_applicationRepository, _operatorRepository);
    }

    [Fact]
    public async Task Handle_ShouldReturnReconciliationReport_WithCorrectSummary()
    {
        // Arrange
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = new GetReconciliationReportQuery(startDate, endDate);

        var operatorId = Guid.NewGuid();
        var applications = new List<FopApplication>
        {
            CreateApplicationWithCompletedVerifiedPayment(operatorId, 1000m),
            CreateApplicationWithCompletedUnverifiedPayment(operatorId, 500m),
            CreateApplicationWithPendingPayment(operatorId, 750m)
        };

        var operators = new List<Operator>
        {
            CreateOperator(operatorId, "Test Airways")
        };

        _applicationRepository.GetWithPaymentsInPeriodAsync(
                Arg.Any<DateTime>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(applications);

        _operatorRepository.GetByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(operators);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var report = result.Value;
        report.Summary.TotalPayments.Should().Be(3);
        report.Summary.VerifiedCount.Should().Be(1);
        report.Summary.UnverifiedCount.Should().Be(1);
        report.Summary.PendingCount.Should().Be(1);
        report.Summary.TotalVerified.Should().Be(1000m);
        report.Summary.TotalUnverified.Should().Be(500m);
        report.Summary.TotalPending.Should().Be(750m);
        report.Summary.TotalCollected.Should().Be(1500m); // Verified + Unverified
    }

    [Fact]
    public async Task Handle_ShouldCategorizePaymentsCorrectly()
    {
        // Arrange
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = new GetReconciliationReportQuery(startDate, endDate);

        var operatorId = Guid.NewGuid();
        var applications = new List<FopApplication>
        {
            CreateApplicationWithCompletedVerifiedPayment(operatorId, 1000m),
            CreateApplicationWithCompletedUnverifiedPayment(operatorId, 500m),
        };

        var operators = new List<Operator>
        {
            CreateOperator(operatorId, "Test Airways")
        };

        _applicationRepository.GetWithPaymentsInPeriodAsync(
                Arg.Any<DateTime>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(applications);

        _operatorRepository.GetByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(operators);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var report = result.Value;
        report.VerifiedPayments.Should().HaveCount(1);
        report.UnverifiedPayments.Should().HaveCount(1);
        report.VerifiedPayments.First().IsVerified.Should().BeTrue();
        report.UnverifiedPayments.First().IsVerified.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithNoPayments_ShouldReturnEmptyReport()
    {
        // Arrange
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = new GetReconciliationReportQuery(startDate, endDate);

        _applicationRepository.GetWithPaymentsInPeriodAsync(
                Arg.Any<DateTime>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(new List<FopApplication>());

        _operatorRepository.GetByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(new List<Operator>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var report = result.Value;
        report.Summary.TotalPayments.Should().Be(0);
        report.VerifiedPayments.Should().BeEmpty();
        report.UnverifiedPayments.Should().BeEmpty();
        report.PendingPayments.Should().BeEmpty();
        report.RefundedPayments.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldIncludeOperatorName_InPaymentItems()
    {
        // Arrange
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = new GetReconciliationReportQuery(startDate, endDate);

        var operatorId = Guid.NewGuid();
        var applications = new List<FopApplication>
        {
            CreateApplicationWithCompletedVerifiedPayment(operatorId, 1000m)
        };

        var operators = new List<Operator>
        {
            CreateOperator(operatorId, "Caribbean Air Express")
        };

        _applicationRepository.GetWithPaymentsInPeriodAsync(
                Arg.Any<DateTime>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(applications);

        _operatorRepository.GetByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(operators);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var report = result.Value;
        report.VerifiedPayments.First().OperatorName.Should().Be("Caribbean Air Express");
    }

    private static FopApplication CreateApplicationWithCompletedVerifiedPayment(Guid operatorId, decimal amount)
    {
        var application = CreateApplication(operatorId, amount);
        AddRequiredDocuments(application);
        application.Submit();
        application.StartReview("reviewer-001");
        VerifyAllDocuments(application);
        application.RequestPayment(PaymentMethod.CreditCard);
        application.CompletePayment("TXN-" + Guid.NewGuid().ToString("N")[..8], "RCP-001");
        application.Payment!.Verify("finance@test.com", "Verified");
        return application;
    }

    private static FopApplication CreateApplicationWithCompletedUnverifiedPayment(Guid operatorId, decimal amount)
    {
        var application = CreateApplication(operatorId, amount);
        AddRequiredDocuments(application);
        application.Submit();
        application.StartReview("reviewer-001");
        VerifyAllDocuments(application);
        application.RequestPayment(PaymentMethod.CreditCard);
        application.CompletePayment("TXN-" + Guid.NewGuid().ToString("N")[..8], "RCP-002");
        return application;
    }

    private static FopApplication CreateApplicationWithPendingPayment(Guid operatorId, decimal amount)
    {
        var application = CreateApplication(operatorId, amount);
        AddRequiredDocuments(application);
        application.Submit();
        application.StartReview("reviewer-001");
        VerifyAllDocuments(application);
        application.RequestPayment(PaymentMethod.CreditCard);
        return application;
    }

    private static FopApplication CreateApplication(Guid operatorId, decimal amount = 1000m)
    {
        var flightDetails = FlightDetails.Create(
            FlightPurpose.Charter,
            "TUPJ",
            "TNCM",
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            numberOfPassengers: 100);

        return FopApplication.Create(
            ApplicationType.OneTime,
            operatorId,
            Guid.NewGuid(),
            flightDetails,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
            Money.Usd(amount));
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

    private static Operator CreateOperator(Guid id, string name)
    {
        var address = Address.Create("123 Test St", "Test City", "USA");
        var contactInfo = ContactInfo.Create("contact@test.com", "+1-555-1234");
        var authorizedRep = AuthorizedRepresentative.Create("John Doe", "CEO", "john@test.com", "+1-555-5678");

        var op = Operator.Create(
            name,
            "REG-" + Guid.NewGuid().ToString("N")[..6],
            "USA",
            address,
            contactInfo,
            authorizedRep,
            "AOC-001",
            "FAA",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)));

        // Use reflection to set the correct ID
        typeof(Operator).GetProperty("Id")!.SetValue(op, id);
        return op;
    }
}
