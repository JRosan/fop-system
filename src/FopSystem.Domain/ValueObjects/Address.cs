namespace FopSystem.Domain.ValueObjects;

public sealed class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string? State { get; }
    public string? PostalCode { get; }
    public string Country { get; }

    private Address(string street, string city, string? state, string? postalCode, string country)
    {
        Street = street;
        City = city;
        State = state;
        PostalCode = postalCode;
        Country = country;
    }

    public static Address Create(
        string street,
        string city,
        string country,
        string? state = null,
        string? postalCode = null)
    {
        if (string.IsNullOrWhiteSpace(street))
        {
            throw new ArgumentException("Street is required", nameof(street));
        }

        if (string.IsNullOrWhiteSpace(city))
        {
            throw new ArgumentException("City is required", nameof(city));
        }

        if (string.IsNullOrWhiteSpace(country))
        {
            throw new ArgumentException("Country is required", nameof(country));
        }

        return new Address(street.Trim(), city.Trim(), state?.Trim(), postalCode?.Trim(), country.Trim());
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return PostalCode;
        yield return Country;
    }

    public override string ToString()
    {
        var parts = new List<string> { Street, City };
        if (!string.IsNullOrWhiteSpace(State)) parts.Add(State);
        if (!string.IsNullOrWhiteSpace(PostalCode)) parts.Add(PostalCode);
        parts.Add(Country);
        return string.Join(", ", parts);
    }
}
