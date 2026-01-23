using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Enums;

namespace FopSystem.Application.Interfaces;

/// <summary>
/// Service for generating and validating JWT tokens for offline permit verification.
/// </summary>
public interface IJwtPermitTokenService
{
    /// <summary>
    /// Generates a signed JWT token containing permit data for offline verification.
    /// </summary>
    /// <param name="permit">The permit to generate a token for.</param>
    /// <param name="expiresInDays">Number of days until the token expires (default 30).</param>
    /// <returns>The signed JWT token string and expiration date.</returns>
    Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(
        Permit permit,
        int expiresInDays = 30);

    /// <summary>
    /// Validates a JWT token and extracts permit claims.
    /// Returns the verification result and extracted claims if valid.
    /// </summary>
    /// <param name="token">The JWT token to validate.</param>
    /// <returns>Validation result with permit claims if valid.</returns>
    Task<PermitTokenValidationResult> ValidateTokenAsync(string token);

    /// <summary>
    /// Gets the public key for offline verification by mobile clients.
    /// </summary>
    /// <returns>The public key in PEM format.</returns>
    string GetPublicKey();
}

/// <summary>
/// Result of validating a permit JWT token.
/// </summary>
public sealed record PermitTokenValidationResult(
    bool IsValid,
    VerificationResult Result,
    string? FailureReason = null,
    PermitTokenClaims? Claims = null);

/// <summary>
/// Claims extracted from a valid permit JWT token.
/// </summary>
public sealed record PermitTokenClaims(
    Guid PermitId,
    string PermitNumber,
    Guid OperatorId,
    string OperatorName,
    string AircraftRegistration,
    DateOnly ValidFrom,
    DateOnly ValidUntil,
    PermitStatus Status,
    DateTime TokenIssuedAt,
    DateTime TokenExpiresAt);
