using FopSystem.Domain.Entities;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Operator;

public class Operator : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = default!;
    public string? TradingName { get; private set; }
    public string RegistrationNumber { get; private set; } = default!;
    public string Country { get; private set; } = default!;
    public Address Address { get; private set; } = default!;
    public ContactInfo ContactInfo { get; private set; } = default!;
    public AuthorizedRepresentative AuthorizedRepresentative { get; private set; } = default!;
    public string AocNumber { get; private set; } = default!;
    public string AocIssuingAuthority { get; private set; } = default!;
    public DateOnly AocExpiryDate { get; private set; }

    private readonly List<Aircraft.Aircraft> _aircraft = [];
    public IReadOnlyList<Aircraft.Aircraft> Aircraft => _aircraft.AsReadOnly();

    private Operator() { }

    public static Operator Create(
        string name,
        string registrationNumber,
        string country,
        Address address,
        ContactInfo contactInfo,
        AuthorizedRepresentative authorizedRepresentative,
        string aocNumber,
        string aocIssuingAuthority,
        DateOnly aocExpiryDate,
        string? tradingName = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(registrationNumber))
            throw new ArgumentException("Registration number is required", nameof(registrationNumber));

        if (string.IsNullOrWhiteSpace(country))
            throw new ArgumentException("Country is required", nameof(country));

        if (string.IsNullOrWhiteSpace(aocNumber))
            throw new ArgumentException("AOC number is required", nameof(aocNumber));

        return new Operator
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            TradingName = tradingName?.Trim(),
            RegistrationNumber = registrationNumber.Trim(),
            Country = country.Trim(),
            Address = address,
            ContactInfo = contactInfo,
            AuthorizedRepresentative = authorizedRepresentative,
            AocNumber = aocNumber.Trim(),
            AocIssuingAuthority = aocIssuingAuthority.Trim(),
            AocExpiryDate = aocExpiryDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        string? name = null,
        string? tradingName = null,
        Address? address = null,
        ContactInfo? contactInfo = null,
        AuthorizedRepresentative? authorizedRepresentative = null,
        string? aocNumber = null,
        string? aocIssuingAuthority = null,
        DateOnly? aocExpiryDate = null)
    {
        if (name is not null) Name = name.Trim();
        TradingName = tradingName?.Trim();
        if (address is not null) Address = address;
        if (contactInfo is not null) ContactInfo = contactInfo;
        if (authorizedRepresentative is not null) AuthorizedRepresentative = authorizedRepresentative;
        if (aocNumber is not null) AocNumber = aocNumber.Trim();
        if (aocIssuingAuthority is not null) AocIssuingAuthority = aocIssuingAuthority.Trim();
        if (aocExpiryDate is not null) AocExpiryDate = aocExpiryDate.Value;
        SetUpdatedAt();
    }

    public bool IsAocExpired(DateOnly asOfDate) => asOfDate > AocExpiryDate;

    public void AddAircraft(Aircraft.Aircraft aircraft)
    {
        _aircraft.Add(aircraft);
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}

public sealed class AuthorizedRepresentative : ValueObject
{
    public string Name { get; }
    public string Title { get; }
    public string Email { get; }
    public string Phone { get; }

    private AuthorizedRepresentative(string name, string title, string email, string phone)
    {
        Name = name;
        Title = title;
        Email = email;
        Phone = phone;
    }

    public static AuthorizedRepresentative Create(string name, string title, string email, string phone)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required", nameof(title));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required", nameof(email));
        if (string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Phone is required", nameof(phone));

        return new AuthorizedRepresentative(name.Trim(), title.Trim(), email.Trim().ToLowerInvariant(), phone.Trim());
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Name;
        yield return Title;
        yield return Email;
        yield return Phone;
    }
}
