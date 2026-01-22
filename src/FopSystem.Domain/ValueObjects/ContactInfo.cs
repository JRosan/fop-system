using System.Text.RegularExpressions;

namespace FopSystem.Domain.ValueObjects;

public sealed partial class ContactInfo : ValueObject
{
    public string Email { get; }
    public string Phone { get; }
    public string? Fax { get; }

    private ContactInfo(string email, string phone, string? fax)
    {
        Email = email;
        Phone = phone;
        Fax = fax;
    }

    public static ContactInfo Create(string email, string phone, string? fax = null)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required", nameof(email));
        }

        if (!EmailRegex().IsMatch(email))
        {
            throw new ArgumentException("Invalid email format", nameof(email));
        }

        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ArgumentException("Phone is required", nameof(phone));
        }

        return new ContactInfo(email.Trim().ToLowerInvariant(), phone.Trim(), fax?.Trim());
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Email;
        yield return Phone;
        yield return Fax;
    }

    public override string ToString() => $"{Email}, {Phone}";

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
