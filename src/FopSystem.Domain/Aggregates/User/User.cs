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
}

public enum UserRole
{
    Applicant = 1,
    Reviewer = 2,
    Approver = 3,
    FinanceOfficer = 4,
    Administrator = 5
}
