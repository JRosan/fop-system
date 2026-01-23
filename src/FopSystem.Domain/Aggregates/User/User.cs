using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Aggregates.User;

public class User : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string Email { get; private set; } = default!;
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string? Phone { get; private set; }
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public string? AzureAdObjectId { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    // Email verification
    public bool IsEmailVerified { get; private set; }
    public string? EmailVerificationToken { get; private set; }
    public DateTime? EmailVerificationTokenExpiry { get; private set; }

    // Password reset
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }

    // Company/organization info (for self-registration)
    public string? CompanyName { get; private set; }

    public string FullName => $"{FirstName} {LastName}";

    private User() { }

    public static User Create(
        string email,
        string firstName,
        string lastName,
        UserRole role,
        string? phone = null,
        string? azureAdObjectId = null)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required", nameof(email));
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required", nameof(lastName));

        return new User
        {
            Id = Guid.NewGuid(),
            Email = email.Trim().ToLowerInvariant(),
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Phone = phone?.Trim(),
            Role = role,
            IsActive = true,
            AzureAdObjectId = azureAdObjectId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        string? firstName = null,
        string? lastName = null,
        string? phone = null,
        UserRole? role = null)
    {
        if (firstName is not null) FirstName = firstName.Trim();
        if (lastName is not null) LastName = lastName.Trim();
        Phone = phone?.Trim();
        if (role is not null) Role = role.Value;
        SetUpdatedAt();
    }

    public void Activate()
    {
        if (IsActive)
            throw new InvalidOperationException("User is already active");

        IsActive = true;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        if (!IsActive)
            throw new InvalidOperationException("User is already inactive");

        IsActive = false;
        SetUpdatedAt();
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void LinkAzureAdAccount(string objectId)
    {
        if (string.IsNullOrWhiteSpace(objectId))
            throw new ArgumentException("Azure AD Object ID is required", nameof(objectId));

        AzureAdObjectId = objectId;
        SetUpdatedAt();
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }

    public void SetCompanyName(string? companyName)
    {
        CompanyName = companyName?.Trim();
        SetUpdatedAt();
    }

    public void GenerateEmailVerificationToken()
    {
        EmailVerificationToken = Guid.NewGuid().ToString("N");
        EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        IsEmailVerified = false;
        SetUpdatedAt();
    }

    public bool VerifyEmail(string token)
    {
        if (IsEmailVerified)
            return true;

        if (string.IsNullOrEmpty(EmailVerificationToken) ||
            EmailVerificationToken != token ||
            EmailVerificationTokenExpiry < DateTime.UtcNow)
        {
            return false;
        }

        IsEmailVerified = true;
        EmailVerificationToken = null;
        EmailVerificationTokenExpiry = null;
        SetUpdatedAt();
        return true;
    }

    public void GeneratePasswordResetToken()
    {
        PasswordResetToken = Guid.NewGuid().ToString("N");
        PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        SetUpdatedAt();
    }

    public bool ValidatePasswordResetToken(string token)
    {
        return !string.IsNullOrEmpty(PasswordResetToken) &&
               PasswordResetToken == token &&
               PasswordResetTokenExpiry > DateTime.UtcNow;
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        SetUpdatedAt();
    }
}

public enum UserRole
{
    Applicant = 1,
    Reviewer = 2,
    Approver = 3,
    FinanceOfficer = 4,
    Administrator = 5
}
