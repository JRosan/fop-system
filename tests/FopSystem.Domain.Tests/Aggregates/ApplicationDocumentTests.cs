using FluentAssertions;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Exceptions;
using Xunit;

namespace FopSystem.Domain.Tests.Aggregates;

public class ApplicationDocumentTests
{
    [Fact]
    public void Verify_WhenDocumentIsValid_ShouldSetStatusToVerified()
    {
        // Arrange
        var document = CreateDocument(expiryDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(60)));

        // Act
        document.Verify("reviewer@test.com");

        // Assert
        document.Status.Should().Be(DocumentStatus.Verified);
        document.VerifiedBy.Should().Be("reviewer@test.com");
        document.VerifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Verify_WhenDocumentHasNoExpiryDate_ShouldSucceed()
    {
        // Arrange
        var document = CreateDocument(expiryDate: null);

        // Act
        document.Verify("reviewer@test.com");

        // Assert
        document.Status.Should().Be(DocumentStatus.Verified);
    }

    [Fact]
    public void Verify_WhenDocumentIsExpired_ShouldThrowDocumentExpiredException()
    {
        // Arrange
        var expiredDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var document = CreateDocument(expiryDate: expiredDate);

        // Act
        var action = () => document.Verify("reviewer@test.com");

        // Assert
        action.Should().Throw<DocumentExpiredException>()
            .Which.DocumentType.Should().Be(DocumentType.InsuranceCertificate);
    }

    [Fact]
    public void Verify_WhenDocumentExpiresToday_ShouldThrowDocumentExpiredException()
    {
        // Arrange - Document that expired today (at midnight)
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);
        var document = CreateDocument(expiryDate: yesterday);

        // Act
        var action = () => document.Verify("reviewer@test.com");

        // Assert
        action.Should().Throw<DocumentExpiredException>();
    }

    [Fact]
    public void IsExpired_WhenExpiryDateInPast_ShouldReturnTrue()
    {
        // Arrange
        var expiredDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var document = CreateDocument(expiryDate: expiredDate);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.IsExpired(today);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsExpired_WhenExpiryDateInFuture_ShouldReturnFalse()
    {
        // Arrange
        var futureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));
        var document = CreateDocument(expiryDate: futureDate);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.IsExpired(today);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WhenNoExpiryDate_ShouldReturnFalse()
    {
        // Arrange
        var document = CreateDocument(expiryDate: null);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.IsExpired(today);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpiringSoon_WhenExpiryWithin30Days_ShouldReturnTrue()
    {
        // Arrange
        var expiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15));
        var document = CreateDocument(expiryDate: expiryDate);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.IsExpiringSoon(today, 30);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsExpiringSoon_WhenExpiryBeyond30Days_ShouldReturnFalse()
    {
        // Arrange
        var expiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(60));
        var document = CreateDocument(expiryDate: expiryDate);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.IsExpiringSoon(today, 30);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpiringSoon_WhenAlreadyExpired_ShouldReturnFalse()
    {
        // Arrange
        var expiredDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5));
        var document = CreateDocument(expiryDate: expiredDate);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.IsExpiringSoon(today, 30);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void DaysUntilExpiry_ShouldReturnCorrectDays()
    {
        // Arrange
        var expiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15));
        var document = CreateDocument(expiryDate: expiryDate);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.DaysUntilExpiry(today);

        // Assert
        result.Should().Be(15);
    }

    [Fact]
    public void DaysUntilExpiry_WhenNoExpiryDate_ShouldReturnNull()
    {
        // Arrange
        var document = CreateDocument(expiryDate: null);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = document.DaysUntilExpiry(today);

        // Assert
        result.Should().BeNull();
    }

    private static ApplicationDocument CreateDocument(DateOnly? expiryDate)
    {
        return ApplicationDocument.Create(
            Guid.NewGuid(),
            DocumentType.InsuranceCertificate,
            "insurance.pdf",
            1024,
            "application/pdf",
            "https://storage.test/docs/insurance.pdf",
            "uploader@test.com",
            expiryDate);
    }
}
