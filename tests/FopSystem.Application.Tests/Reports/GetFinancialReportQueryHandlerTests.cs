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

public class GetFinancialReportQueryHandlerTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly GetFinancialReportQueryHandler _handler;

    public GetFinancialReportQueryHandlerTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _operatorRepository = Substitute.For<IOperatorRepository>();
        _handler = new GetFinancialReportQueryHandler(_applicationRepository, _operatorRepository);
    }

    [Fact]
    public async Task Handle_WithNoFilters_ShouldReturnReport()
    {
        // Arrange
        var applications = new List<FopApplication>();
        _applicationRepository.GetPagedAsync(
            Arg.Any<ApplicationStatus[]?>(),
            Arg.Any<ApplicationType[]?>(),
            Arg.Any<Guid?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<CancellationToken>())
            .Returns((applications, 0));

        var query = new GetFinancialReportQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Summary.TotalRevenue.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WithDateRange_ShouldFilterByDates()
    {
        // Arrange
        var fromDate = DateTime.UtcNow.AddDays(-30);
        var toDate = DateTime.UtcNow;
        var applications = new List<FopApplication>();

        _applicationRepository.GetPagedAsync(
            Arg.Any<ApplicationStatus[]?>(),
            Arg.Any<ApplicationType[]?>(),
            Arg.Any<Guid?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<CancellationToken>())
            .Returns((applications, 0));

        var query = new GetFinancialReportQuery(fromDate, toDate);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.FromDate.Should().Be(fromDate);
        result.Value.ToDate.Should().Be(toDate);
    }

    [Fact]
    public async Task Handle_WithApplicationTypeFilter_ShouldFilterByType()
    {
        // Arrange
        var applications = new List<FopApplication>();

        _applicationRepository.GetPagedAsync(
            Arg.Any<ApplicationStatus[]?>(),
            Arg.Any<ApplicationType[]?>(),
            Arg.Any<Guid?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<CancellationToken>())
            .Returns((applications, 0));

        var query = new GetFinancialReportQuery(Type: ApplicationType.OneTime);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _applicationRepository.Received(1).GetPagedAsync(
            Arg.Any<ApplicationStatus[]?>(),
            Arg.Is<ApplicationType[]?>(t => t != null && t.Contains(ApplicationType.OneTime)),
            Arg.Any<Guid?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldReturnReportGeneratedTimestamp()
    {
        // Arrange
        _applicationRepository.GetPagedAsync(
            Arg.Any<ApplicationStatus[]?>(),
            Arg.Any<ApplicationType[]?>(),
            Arg.Any<Guid?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<DateTime?>(),
            Arg.Any<string?>(),
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<CancellationToken>())
            .Returns((new List<FopApplication>(), 0));

        var query = new GetFinancialReportQuery();
        var beforeCall = DateTime.UtcNow;

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ReportGeneratedAt.Should().BeOnOrAfter(beforeCall);
    }
}
