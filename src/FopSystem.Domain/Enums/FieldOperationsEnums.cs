using System.Text.Json.Serialization;

namespace FopSystem.Domain.Enums;

/// <summary>
/// Types of airport services that can be logged in the field.
/// Each service has associated fee rates defined by BVIAA.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<AirportServiceType>))]
public enum AirportServiceType
{
    /// <summary>Sewerage disposal service - $300 flat fee</summary>
    SewerageDumping = 1,

    /// <summary>Fire truck standby service - $25 per service</summary>
    FireTruckStandby = 2,

    /// <summary>Fuel flow charge - $0.20 per gallon</summary>
    FuelFlow = 3,

    /// <summary>Ground handling service</summary>
    GroundHandling = 4,

    /// <summary>Aircraft towing service</summary>
    AircraftTowing = 5,

    /// <summary>Potable water service</summary>
    WaterService = 6,

    /// <summary>Ground power unit (GPU) service</summary>
    GpuService = 7,

    /// <summary>De-icing service (rare in BVI)</summary>
    DeIcing = 8,

    /// <summary>Baggage handling service</summary>
    BaggageHandling = 9,

    /// <summary>Passenger stairs/steps service</summary>
    PassengerStairs = 10,

    /// <summary>Lavatory service</summary>
    LavatoryService = 11,

    /// <summary>Catering vehicle access</summary>
    CateringAccess = 12
}

/// <summary>
/// Result of a permit verification scan.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<VerificationResult>))]
public enum VerificationResult
{
    /// <summary>Permit is valid and active</summary>
    Valid = 1,

    /// <summary>Permit has expired</summary>
    Expired = 2,

    /// <summary>Permit has been revoked</summary>
    Revoked = 3,

    /// <summary>Permit is temporarily suspended</summary>
    Suspended = 4,

    /// <summary>Permit not found in system</summary>
    NotFound = 5,

    /// <summary>QR code signature is invalid (possible tampering)</summary>
    InvalidSignature = 6,

    /// <summary>QR code format is invalid or corrupted</summary>
    InvalidFormat = 7,

    /// <summary>JWT token has expired (for offline verification)</summary>
    TokenExpired = 8
}

/// <summary>
/// Status of an airport service log entry.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<AirportServiceLogStatus>))]
public enum AirportServiceLogStatus
{
    /// <summary>Service logged but not yet invoiced</summary>
    Pending = 1,

    /// <summary>Service has been added to an invoice</summary>
    Invoiced = 2,

    /// <summary>Service log was cancelled</summary>
    Cancelled = 3,

    /// <summary>Service was logged offline and is pending sync</summary>
    PendingSync = 4
}

/// <summary>
/// Types of telemetry events for ML training and analytics.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<TelemetryEventType>))]
public enum TelemetryEventType
{
    /// <summary>A permit was verified via QR scan</summary>
    PermitVerified = 1,

    /// <summary>An airport service was logged</summary>
    ServiceLogged = 2,

    /// <summary>User acted on a push notification</summary>
    NotificationActioned = 3,

    /// <summary>Biometric authentication was performed</summary>
    BiometricAuth = 4,

    /// <summary>User opened the app</summary>
    AppOpened = 5,

    /// <summary>User performed a search</summary>
    SearchPerformed = 6,

    /// <summary>Offline data was synced</summary>
    OfflineSync = 7,

    /// <summary>Error occurred in the mobile app</summary>
    MobileError = 8,

    /// <summary>QR code was scanned (regardless of result)</summary>
    QrScanned = 9,

    /// <summary>Location permission was granted or denied</summary>
    LocationPermission = 10,

    /// <summary>Fee calculation was performed</summary>
    FeeCalculated = 11
}
