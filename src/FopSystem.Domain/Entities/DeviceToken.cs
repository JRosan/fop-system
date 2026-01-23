namespace FopSystem.Domain.Entities;

/// <summary>
/// Represents a push notification device registration token.
/// </summary>
public class DeviceToken : Entity<Guid>, ITenantEntity
{
    public Guid UserId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public string Platform { get; private set; } = string.Empty; // ios, android, web
    public string? DeviceId { get; private set; }
    public DateTime RegisteredAt { get; private set; }
    public DateTime? LastUsedAt { get; private set; }
    public bool IsActive { get; private set; }

    // For multi-tenancy
    public Guid TenantId { get; private set; }

    private DeviceToken() { }

    public static DeviceToken Create(
        Guid userId,
        string token,
        string platform,
        string? deviceId,
        Guid tenantId)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Token cannot be empty", nameof(token));

        if (string.IsNullOrWhiteSpace(platform))
            throw new ArgumentException("Platform cannot be empty", nameof(platform));

        var validPlatforms = new[] { "ios", "android", "web" };
        if (!validPlatforms.Contains(platform.ToLowerInvariant()))
            throw new ArgumentException("Platform must be ios, android, or web", nameof(platform));

        return new DeviceToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = token,
            Platform = platform.ToLowerInvariant(),
            DeviceId = deviceId,
            TenantId = tenantId,
            RegisteredAt = DateTime.UtcNow,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void UpdateLastUsed()
    {
        LastUsedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reactivate(string newToken)
    {
        Token = newToken;
        IsActive = true;
        RegisteredAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
