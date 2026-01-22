namespace FopSystem.Application.DTOs;

public sealed record OperatorDto(
    Guid Id,
    string Name,
    string? TradingName,
    string RegistrationNumber,
    string Country,
    AddressDto Address,
    ContactInfoDto ContactInfo,
    AuthorizedRepresentativeDto AuthorizedRepresentative,
    string AocNumber,
    string AocIssuingAuthority,
    DateOnly AocExpiryDate,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record OperatorSummaryDto(
    Guid Id,
    string Name,
    string Country,
    string AocNumber,
    DateOnly AocExpiryDate);

public sealed record AddressDto(
    string Street,
    string City,
    string? State,
    string? PostalCode,
    string Country);

public sealed record ContactInfoDto(
    string Email,
    string Phone,
    string? Fax);

public sealed record AuthorizedRepresentativeDto(
    string Name,
    string Title,
    string Email,
    string Phone);
