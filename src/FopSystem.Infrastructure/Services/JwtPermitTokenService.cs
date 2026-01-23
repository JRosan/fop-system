using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FopSystem.Infrastructure.Services;

public class JwtPermitTokenService : IJwtPermitTokenService
{
    private readonly RsaSecurityKey _privateKey;
    private readonly RsaSecurityKey _publicKey;
    private readonly string _issuer;
    private readonly string _audience;

    public JwtPermitTokenService(IConfiguration configuration)
    {
        _issuer = configuration["JwtPermit:Issuer"] ?? "BVI-FOP-System";
        _audience = configuration["JwtPermit:Audience"] ?? "BVI-Field-Officers";

        // Generate or load RSA keys
        var keyString = configuration["JwtPermit:PrivateKey"];
        RSA rsa;

        if (!string.IsNullOrEmpty(keyString))
        {
            rsa = RSA.Create();
            rsa.ImportFromPem(keyString);
        }
        else
        {
            // Generate new key pair for development
            rsa = RSA.Create(2048);
        }

        _privateKey = new RsaSecurityKey(rsa) { KeyId = "permit-signing-key" };

        // Extract public key
        var publicRsa = RSA.Create();
        publicRsa.ImportRSAPublicKey(rsa.ExportRSAPublicKey(), out _);
        _publicKey = new RsaSecurityKey(publicRsa) { KeyId = "permit-signing-key" };
    }

    public Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(Permit permit, int expiresInDays = 30)
    {
        var expiresAt = DateTime.UtcNow.AddDays(expiresInDays);

        var claims = new[]
        {
            new Claim("permit_id", permit.Id.ToString()),
            new Claim("permit_number", permit.PermitNumber),
            new Claim("operator_id", permit.OperatorId.ToString()),
            new Claim("operator_name", permit.OperatorName),
            new Claim("aircraft_registration", permit.AircraftRegistration),
            new Claim("valid_from", permit.ValidFrom.ToString("yyyy-MM-dd")),
            new Claim("valid_until", permit.ValidUntil.ToString("yyyy-MM-dd")),
            new Claim("status", permit.Status.ToString()),
            new Claim("permit_type", permit.Type.ToString())
        };

        var signingCredentials = new SigningCredentials(
            _privateKey,
            SecurityAlgorithms.RsaSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = _issuer,
            Audience = _audience,
            Expires = expiresAt,
            IssuedAt = DateTime.UtcNow,
            SigningCredentials = signingCredentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Task.FromResult((tokenString, expiresAt));
    }

    public Task<PermitTokenValidationResult> ValidateTokenAsync(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _publicKey,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken)
            {
                return Task.FromResult(new PermitTokenValidationResult(
                    false,
                    VerificationResult.InvalidFormat,
                    "Invalid token format"));
            }

            // Extract claims
            var permitIdClaim = principal.FindFirst("permit_id")?.Value;
            var permitNumberClaim = principal.FindFirst("permit_number")?.Value;
            var operatorIdClaim = principal.FindFirst("operator_id")?.Value;
            var operatorNameClaim = principal.FindFirst("operator_name")?.Value;
            var aircraftRegClaim = principal.FindFirst("aircraft_registration")?.Value;
            var validFromClaim = principal.FindFirst("valid_from")?.Value;
            var validUntilClaim = principal.FindFirst("valid_until")?.Value;
            var statusClaim = principal.FindFirst("status")?.Value;

            if (string.IsNullOrEmpty(permitIdClaim) ||
                string.IsNullOrEmpty(permitNumberClaim) ||
                string.IsNullOrEmpty(operatorIdClaim))
            {
                return Task.FromResult(new PermitTokenValidationResult(
                    false,
                    VerificationResult.InvalidFormat,
                    "Missing required claims"));
            }

            var claims = new PermitTokenClaims(
                PermitId: Guid.Parse(permitIdClaim),
                PermitNumber: permitNumberClaim,
                OperatorId: Guid.Parse(operatorIdClaim),
                OperatorName: operatorNameClaim ?? "Unknown",
                AircraftRegistration: aircraftRegClaim ?? "Unknown",
                ValidFrom: DateOnly.Parse(validFromClaim ?? DateOnly.MinValue.ToString()),
                ValidUntil: DateOnly.Parse(validUntilClaim ?? DateOnly.MinValue.ToString()),
                Status: Enum.TryParse<PermitStatus>(statusClaim, out var status) ? status : PermitStatus.Active,
                TokenIssuedAt: jwtToken.IssuedAt,
                TokenExpiresAt: jwtToken.ValidTo);

            return Task.FromResult(new PermitTokenValidationResult(
                true,
                VerificationResult.Valid,
                null,
                claims));
        }
        catch (SecurityTokenExpiredException)
        {
            return Task.FromResult(new PermitTokenValidationResult(
                false,
                VerificationResult.TokenExpired,
                "Token has expired"));
        }
        catch (SecurityTokenInvalidSignatureException)
        {
            return Task.FromResult(new PermitTokenValidationResult(
                false,
                VerificationResult.InvalidSignature,
                "Token signature is invalid"));
        }
        catch (SecurityTokenException ex)
        {
            return Task.FromResult(new PermitTokenValidationResult(
                false,
                VerificationResult.InvalidFormat,
                $"Token validation failed: {ex.Message}"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(new PermitTokenValidationResult(
                false,
                VerificationResult.InvalidFormat,
                $"Unexpected error: {ex.Message}"));
        }
    }

    public string GetPublicKey()
    {
        var rsa = _publicKey.Rsa;
        if (rsa == null)
        {
            throw new InvalidOperationException("RSA key not available");
        }

        var publicKeyBytes = rsa.ExportRSAPublicKey();
        var base64 = Convert.ToBase64String(publicKeyBytes);

        var sb = new StringBuilder();
        sb.AppendLine("-----BEGIN RSA PUBLIC KEY-----");
        for (var i = 0; i < base64.Length; i += 64)
        {
            sb.AppendLine(base64.Substring(i, Math.Min(64, base64.Length - i)));
        }
        sb.AppendLine("-----END RSA PUBLIC KEY-----");

        return sb.ToString();
    }
}
