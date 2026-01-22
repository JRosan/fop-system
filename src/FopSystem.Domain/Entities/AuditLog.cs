namespace FopSystem.Domain.Entities;

public class AuditLog : Entity<Guid>
{
    public string EntityType { get; private set; } = default!;
    public Guid EntityId { get; private set; }
    public string Action { get; private set; } = default!;
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    public string? UserId { get; private set; }
    public string? UserEmail { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }

    private AuditLog() { }

    public static AuditLog Create(
        string entityType,
        Guid entityId,
        string action,
        string? oldValues = null,
        string? newValues = null,
        string? userId = null,
        string? userEmail = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        if (string.IsNullOrWhiteSpace(entityType))
            throw new ArgumentException("Entity type is required", nameof(entityType));
        if (string.IsNullOrWhiteSpace(action))
            throw new ArgumentException("Action is required", nameof(action));

        return new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            OldValues = oldValues,
            NewValues = newValues,
            UserId = userId,
            UserEmail = userEmail,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}

public static class AuditActions
{
    public const string Created = "Created";
    public const string Updated = "Updated";
    public const string Deleted = "Deleted";
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string PaymentProcessed = "PaymentProcessed";
    public const string PaymentRefunded = "PaymentRefunded";
    public const string DocumentUploaded = "DocumentUploaded";
    public const string DocumentVerified = "DocumentVerified";
    public const string DocumentRejected = "DocumentRejected";
    public const string PermitIssued = "PermitIssued";
    public const string PermitRevoked = "PermitRevoked";
    public const string PermitSuspended = "PermitSuspended";
    public const string WaiverRequested = "WaiverRequested";
    public const string WaiverApproved = "WaiverApproved";
    public const string WaiverRejected = "WaiverRejected";
    public const string FeeOverridden = "FeeOverridden";
    public const string UserActivated = "UserActivated";
    public const string UserDeactivated = "UserDeactivated";
    public const string Login = "Login";
}
