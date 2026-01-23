using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Permit;

public class Permit : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string PermitNumber { get; private set; } = default!;
    public Guid ApplicationId { get; private set; }
    public string ApplicationNumber { get; private set; } = default!;
    public ApplicationType Type { get; private set; }
    public PermitStatus Status { get; private set; }

    public Guid OperatorId { get; private set; }
    public string OperatorName { get; private set; } = default!;
    public Guid AircraftId { get; private set; }
    public string AircraftRegistration { get; private set; } = default!;

    public DateOnly ValidFrom { get; private set; }
    public DateOnly ValidUntil { get; private set; }

    public DateTime IssuedAt { get; private set; }
    public string IssuedBy { get; private set; } = default!;

    public Money FeesPaid { get; private set; } = default!;
    public string? DocumentUrl { get; private set; }

    private readonly List<string> _conditions = [];
    public IReadOnlyList<string> Conditions => _conditions.AsReadOnly();

    public string? RevocationReason { get; private set; }
    public string? SuspensionReason { get; private set; }
    public DateOnly? SuspendedUntil { get; private set; }

    private Permit() { }

    public static Permit Issue(
        Guid applicationId,
        string applicationNumber,
        ApplicationType type,
        Guid operatorId,
        string operatorName,
        Guid aircraftId,
        string aircraftRegistration,
        DateOnly validFrom,
        DateOnly validUntil,
        Money feesPaid,
        string issuedBy,
        IEnumerable<string>? conditions = null)
    {
        if (applicationId == Guid.Empty)
            throw new ArgumentException("Application ID is required", nameof(applicationId));
        if (string.IsNullOrWhiteSpace(applicationNumber))
            throw new ArgumentException("Application number is required", nameof(applicationNumber));
        if (operatorId == Guid.Empty)
            throw new ArgumentException("Operator ID is required", nameof(operatorId));
        if (string.IsNullOrWhiteSpace(operatorName))
            throw new ArgumentException("Operator name is required", nameof(operatorName));
        if (aircraftId == Guid.Empty)
            throw new ArgumentException("Aircraft ID is required", nameof(aircraftId));
        if (string.IsNullOrWhiteSpace(aircraftRegistration))
            throw new ArgumentException("Aircraft registration is required", nameof(aircraftRegistration));
        if (validUntil < validFrom)
            throw new ArgumentException("Valid until must be after valid from");
        if (string.IsNullOrWhiteSpace(issuedBy))
            throw new ArgumentException("Issued by is required", nameof(issuedBy));

        var permit = new Permit
        {
            Id = Guid.NewGuid(),
            PermitNumber = GeneratePermitNumber(type),
            ApplicationId = applicationId,
            ApplicationNumber = applicationNumber,
            Type = type,
            Status = PermitStatus.Active,
            OperatorId = operatorId,
            OperatorName = operatorName,
            AircraftId = aircraftId,
            AircraftRegistration = aircraftRegistration,
            ValidFrom = validFrom,
            ValidUntil = validUntil,
            FeesPaid = feesPaid,
            IssuedAt = DateTime.UtcNow,
            IssuedBy = issuedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (conditions is not null)
        {
            permit._conditions.AddRange(conditions.Where(c => !string.IsNullOrWhiteSpace(c)));
        }

        permit.RaiseDomainEvent(new PermitIssuedEvent(
            applicationId,
            permit.Id,
            permit.PermitNumber,
            validFrom,
            validUntil));

        return permit;
    }

    private static string GeneratePermitNumber(ApplicationType type)
    {
        var prefix = type switch
        {
            ApplicationType.OneTime => "BVI-FOP-OT",
            ApplicationType.Blanket => "BVI-FOP-BL",
            ApplicationType.Emergency => "BVI-FOP-EM",
            _ => "BVI-FOP"
        };
        return $"{prefix}-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
    }

    public void SetDocumentUrl(string documentUrl)
    {
        if (string.IsNullOrWhiteSpace(documentUrl))
            throw new ArgumentException("Document URL is required", nameof(documentUrl));

        DocumentUrl = documentUrl;
        SetUpdatedAt();
    }

    public bool IsValid(DateOnly asOfDate) =>
        Status == PermitStatus.Active && asOfDate >= ValidFrom && asOfDate <= ValidUntil;

    public bool IsExpired(DateOnly asOfDate) =>
        asOfDate > ValidUntil;

    public bool IsExpiringSoon(DateOnly asOfDate, int daysThreshold = 30)
    {
        var warningDate = ValidUntil.AddDays(-daysThreshold);
        return Status == PermitStatus.Active && asOfDate >= warningDate && asOfDate <= ValidUntil;
    }

    public int DaysUntilExpiry(DateOnly asOfDate) =>
        ValidUntil.DayNumber - asOfDate.DayNumber;

    public void Expire()
    {
        if (Status != PermitStatus.Active)
            throw new InvalidOperationException($"Cannot expire permit in {Status} status");

        Status = PermitStatus.Expired;
        SetUpdatedAt();
    }

    public void Revoke(string reason)
    {
        if (Status != PermitStatus.Active && Status != PermitStatus.Suspended)
            throw new InvalidOperationException($"Cannot revoke permit in {Status} status");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Revocation reason is required", nameof(reason));

        Status = PermitStatus.Revoked;
        RevocationReason = reason;
        SetUpdatedAt();
    }

    public void Suspend(string reason, DateOnly? suspendUntil = null)
    {
        if (Status != PermitStatus.Active)
            throw new InvalidOperationException($"Cannot suspend permit in {Status} status");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Suspension reason is required", nameof(reason));

        Status = PermitStatus.Suspended;
        SuspensionReason = reason;
        SuspendedUntil = suspendUntil;
        SetUpdatedAt();
    }

    public void Reinstate()
    {
        if (Status != PermitStatus.Suspended)
            throw new InvalidOperationException($"Cannot reinstate permit in {Status} status");

        Status = PermitStatus.Active;
        SuspensionReason = null;
        SuspendedUntil = null;
        SetUpdatedAt();
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
