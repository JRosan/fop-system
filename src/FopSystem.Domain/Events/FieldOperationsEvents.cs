using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Events;

/// <summary>
/// Raised when an airport service is logged by a field officer.
/// </summary>
public sealed record AirportServiceLoggedEvent(
    Guid ServiceLogId,
    string LogNumber,
    Guid? PermitId,
    AirportServiceType ServiceType,
    Money FeeAmount,
    Guid OfficerId,
    GeoCoordinate? Location) : DomainEvent;

/// <summary>
/// Raised when an airport service fee is updated (requires re-auth).
/// </summary>
public sealed record AirportServiceFeeUpdatedEvent(
    Guid ServiceLogId,
    string LogNumber,
    Money OldAmount,
    Money NewAmount,
    string UpdatedBy,
    string Reason) : DomainEvent;

/// <summary>
/// Raised when a field verification is performed via QR scan.
/// </summary>
public sealed record FieldVerificationPerformedEvent(
    Guid VerificationId,
    Guid? PermitId,
    string? PermitNumber,
    VerificationResult Result,
    Guid OfficerId,
    GeoCoordinate? Location,
    bool WasOfflineVerification) : DomainEvent;

/// <summary>
/// Raised when an operator's insurance is about to expire.
/// Used to trigger push notifications.
/// </summary>
public sealed record InsuranceExpiryAlertEvent(
    Guid PermitId,
    Guid OperatorId,
    string OperatorEmail,
    string PermitNumber,
    DateOnly ExpiryDate,
    int DaysUntilExpiry,
    AlertPriority Priority) : DomainEvent;

/// <summary>
/// Raised when an emergency flight is approved.
/// Triggers high-priority push notification.
/// </summary>
public sealed record EmergencyFlightApprovedEvent(
    Guid ApplicationId,
    string ApplicationNumber,
    Guid OperatorId,
    string ApprovedBy,
    string? Notes) : DomainEvent;

/// <summary>
/// Raised when an airport service log is invoiced.
/// </summary>
public sealed record AirportServiceInvoicedEvent(
    Guid ServiceLogId,
    string LogNumber,
    Guid InvoiceId,
    string InvoiceNumber,
    Money FeeAmount) : DomainEvent;

/// <summary>
/// Raised when an airport service log is cancelled.
/// </summary>
public sealed record AirportServiceCancelledEvent(
    Guid ServiceLogId,
    string LogNumber,
    string CancelledBy,
    string Reason) : DomainEvent;

/// <summary>
/// Raised when offline data is synced from a mobile device.
/// </summary>
public sealed record OfflineDataSyncedEvent(
    Guid UserId,
    string DeviceId,
    int ServiceLogsSynced,
    int VerificationLogsSynced,
    DateTime SyncedAt) : DomainEvent;

/// <summary>
/// Raised when a permit JWT token is generated for offline verification.
/// </summary>
public sealed record PermitTokenGeneratedEvent(
    Guid PermitId,
    string PermitNumber,
    DateTime ExpiresAt,
    Guid GeneratedFor) : DomainEvent;

/// <summary>
/// Priority levels for push notification alerts.
/// </summary>
public enum AlertPriority
{
    /// <summary>Standard notification</summary>
    Normal = 1,

    /// <summary>Important notification - appears in notification center</summary>
    High = 2,

    /// <summary>Critical notification - may bypass DND</summary>
    Critical = 3
}
