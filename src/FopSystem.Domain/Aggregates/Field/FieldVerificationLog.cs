using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Field;

/// <summary>
/// Records a permit verification performed by a field officer.
/// Captures the result, location, and context for audit and ML training.
/// </summary>
public class FieldVerificationLog : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }

    public Guid? PermitId { get; private set; }
    public string ScannedPermitNumber { get; private set; } = default!;
    public string? PermitNumber { get; private set; }
    public Guid? OperatorId { get; private set; }
    public string? OperatorName { get; private set; }
    public string? AircraftRegistration { get; private set; }

    public Guid OfficerId { get; private set; }
    public string OfficerName { get; private set; } = default!;
    public string? DeviceId { get; private set; }

    public VerificationResult Result { get; private set; }
    public string? FailureReason { get; private set; }

    public GeoCoordinate? Location { get; private set; }
    public BviAirport? Airport { get; private set; }

    public DateTime VerifiedAt { get; private set; }
    public int ScanDurationMs { get; private set; }

    public bool WasOfflineVerification { get; private set; }
    public DateTime? SyncedAt { get; private set; }

    public string? RawQrContent { get; private set; }
    public string? JwtTokenHash { get; private set; }
    public string? Notes { get; private set; }

    private FieldVerificationLog() { }

    public static FieldVerificationLog RecordVerification(
        string scannedPermitNumber,
        Guid officerId,
        string officerName,
        VerificationResult result,
        int scanDurationMs,
        Guid? permitId = null,
        string? permitNumber = null,
        Guid? operatorId = null,
        string? operatorName = null,
        string? aircraftRegistration = null,
        GeoCoordinate? location = null,
        BviAirport? airport = null,
        string? deviceId = null,
        string? failureReason = null,
        string? rawQrContent = null,
        string? jwtTokenHash = null,
        string? notes = null,
        bool wasOfflineVerification = false)
    {
        if (string.IsNullOrWhiteSpace(scannedPermitNumber))
            throw new ArgumentException("Scanned permit number is required", nameof(scannedPermitNumber));
        if (officerId == Guid.Empty)
            throw new ArgumentException("Officer ID is required", nameof(officerId));
        if (string.IsNullOrWhiteSpace(officerName))
            throw new ArgumentException("Officer name is required", nameof(officerName));
        if (scanDurationMs < 0)
            throw new ArgumentException("Scan duration cannot be negative", nameof(scanDurationMs));

        // Require failure reason for failed verifications
        if (result != VerificationResult.Valid && string.IsNullOrWhiteSpace(failureReason))
        {
            failureReason = result switch
            {
                VerificationResult.Expired => "Permit has expired",
                VerificationResult.Revoked => "Permit has been revoked",
                VerificationResult.Suspended => "Permit is suspended",
                VerificationResult.NotFound => "Permit not found in system",
                VerificationResult.InvalidSignature => "QR code signature verification failed",
                VerificationResult.InvalidFormat => "QR code format is invalid",
                VerificationResult.TokenExpired => "Offline verification token has expired",
                _ => "Unknown verification failure"
            };
        }

        var log = new FieldVerificationLog
        {
            Id = Guid.NewGuid(),
            ScannedPermitNumber = scannedPermitNumber,
            PermitId = permitId,
            PermitNumber = permitNumber,
            OperatorId = operatorId,
            OperatorName = operatorName,
            AircraftRegistration = aircraftRegistration,
            OfficerId = officerId,
            OfficerName = officerName,
            DeviceId = deviceId,
            Result = result,
            FailureReason = failureReason,
            Location = location,
            Airport = airport,
            VerifiedAt = DateTime.UtcNow,
            ScanDurationMs = scanDurationMs,
            WasOfflineVerification = wasOfflineVerification,
            RawQrContent = rawQrContent,
            JwtTokenHash = jwtTokenHash,
            Notes = notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        log.RaiseDomainEvent(new FieldVerificationPerformedEvent(
            log.Id,
            permitId,
            permitNumber,
            result,
            officerId,
            location,
            wasOfflineVerification));

        return log;
    }

    /// <summary>
    /// Factory method for recording a successful verification.
    /// </summary>
    public static FieldVerificationLog RecordSuccessfulVerification(
        Guid permitId,
        string permitNumber,
        Guid operatorId,
        string operatorName,
        string aircraftRegistration,
        Guid officerId,
        string officerName,
        int scanDurationMs,
        GeoCoordinate? location = null,
        BviAirport? airport = null,
        string? deviceId = null,
        bool wasOfflineVerification = false)
    {
        return RecordVerification(
            scannedPermitNumber: permitNumber,
            officerId: officerId,
            officerName: officerName,
            result: VerificationResult.Valid,
            scanDurationMs: scanDurationMs,
            permitId: permitId,
            permitNumber: permitNumber,
            operatorId: operatorId,
            operatorName: operatorName,
            aircraftRegistration: aircraftRegistration,
            location: location,
            airport: airport,
            deviceId: deviceId,
            wasOfflineVerification: wasOfflineVerification);
    }

    /// <summary>
    /// Factory method for recording a failed verification.
    /// </summary>
    public static FieldVerificationLog RecordFailedVerification(
        string scannedPermitNumber,
        VerificationResult result,
        string failureReason,
        Guid officerId,
        string officerName,
        int scanDurationMs,
        GeoCoordinate? location = null,
        BviAirport? airport = null,
        string? deviceId = null,
        string? rawQrContent = null,
        bool wasOfflineVerification = false)
    {
        if (result == VerificationResult.Valid)
            throw new ArgumentException("Use RecordSuccessfulVerification for valid results", nameof(result));

        return RecordVerification(
            scannedPermitNumber: scannedPermitNumber,
            officerId: officerId,
            officerName: officerName,
            result: result,
            scanDurationMs: scanDurationMs,
            failureReason: failureReason,
            location: location,
            airport: airport,
            deviceId: deviceId,
            rawQrContent: rawQrContent,
            wasOfflineVerification: wasOfflineVerification);
    }

    /// <summary>
    /// Marks an offline verification as synced with the server.
    /// </summary>
    public void MarkSynced()
    {
        if (!WasOfflineVerification)
            throw new InvalidOperationException("Cannot sync an online verification");

        if (SyncedAt.HasValue)
            throw new InvalidOperationException("Verification has already been synced");

        SyncedAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    /// <summary>
    /// Adds additional notes to the verification log.
    /// </summary>
    public void AddNotes(string additionalNotes)
    {
        if (string.IsNullOrWhiteSpace(additionalNotes))
            return;

        Notes = string.IsNullOrWhiteSpace(Notes)
            ? additionalNotes
            : $"{Notes}\n{additionalNotes}";
        SetUpdatedAt();
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
