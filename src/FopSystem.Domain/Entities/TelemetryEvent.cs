using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Entities;

/// <summary>
/// Represents a telemetry event captured from mobile devices.
/// Used for ML training, analytics, and operational insights.
/// </summary>
public class TelemetryEvent : Entity<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }

    public TelemetryEventType EventType { get; private set; }

    public Guid? UserId { get; private set; }
    public string? DeviceId { get; private set; }
    public string? SessionId { get; private set; }

    public GeoCoordinate? Location { get; private set; }
    public BviAirport? Airport { get; private set; }

    public DateTime OccurredAt { get; private set; }
    public int? ActionLatencyMs { get; private set; }

    /// <summary>
    /// JSON payload containing event-specific data.
    /// Structure varies by EventType.
    /// </summary>
    public string? JsonPayload { get; private set; }

    // Device metadata
    public string? AppVersion { get; private set; }
    public string? Platform { get; private set; }
    public string? OsVersion { get; private set; }
    public string? NetworkType { get; private set; }

    // Related entities
    public Guid? PermitId { get; private set; }
    public Guid? ServiceLogId { get; private set; }
    public Guid? VerificationLogId { get; private set; }

    private TelemetryEvent() { }

    public static TelemetryEvent Create(
        TelemetryEventType eventType,
        Guid? userId = null,
        string? deviceId = null,
        string? sessionId = null,
        GeoCoordinate? location = null,
        BviAirport? airport = null,
        int? actionLatencyMs = null,
        string? jsonPayload = null,
        string? appVersion = null,
        string? platform = null,
        string? osVersion = null,
        string? networkType = null,
        Guid? permitId = null,
        Guid? serviceLogId = null,
        Guid? verificationLogId = null)
    {
        if (actionLatencyMs.HasValue && actionLatencyMs.Value < 0)
            throw new ArgumentException("Action latency cannot be negative", nameof(actionLatencyMs));

        return new TelemetryEvent
        {
            Id = Guid.NewGuid(),
            EventType = eventType,
            UserId = userId,
            DeviceId = deviceId,
            SessionId = sessionId,
            Location = location,
            Airport = airport,
            OccurredAt = DateTime.UtcNow,
            ActionLatencyMs = actionLatencyMs,
            JsonPayload = jsonPayload,
            AppVersion = appVersion,
            Platform = platform,
            OsVersion = osVersion,
            NetworkType = networkType,
            PermitId = permitId,
            ServiceLogId = serviceLogId,
            VerificationLogId = verificationLogId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Factory for permit verification telemetry.
    /// </summary>
    public static TelemetryEvent ForPermitVerification(
        Guid verificationLogId,
        VerificationResult result,
        int scanDurationMs,
        Guid? userId = null,
        string? deviceId = null,
        GeoCoordinate? location = null,
        BviAirport? airport = null,
        Guid? permitId = null,
        string? appVersion = null,
        string? platform = null,
        string? networkType = null)
    {
        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            result = result.ToString(),
            scanDurationMs
        });

        return Create(
            eventType: TelemetryEventType.PermitVerified,
            userId: userId,
            deviceId: deviceId,
            location: location,
            airport: airport,
            actionLatencyMs: scanDurationMs,
            jsonPayload: payload,
            appVersion: appVersion,
            platform: platform,
            networkType: networkType,
            permitId: permitId,
            verificationLogId: verificationLogId);
    }

    /// <summary>
    /// Factory for service log telemetry.
    /// </summary>
    public static TelemetryEvent ForServiceLogged(
        Guid serviceLogId,
        AirportServiceType serviceType,
        decimal feeAmount,
        Guid? userId = null,
        string? deviceId = null,
        GeoCoordinate? location = null,
        BviAirport? airport = null,
        string? appVersion = null,
        string? platform = null,
        string? networkType = null)
    {
        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            serviceType = serviceType.ToString(),
            feeAmount
        });

        return Create(
            eventType: TelemetryEventType.ServiceLogged,
            userId: userId,
            deviceId: deviceId,
            location: location,
            airport: airport,
            jsonPayload: payload,
            appVersion: appVersion,
            platform: platform,
            networkType: networkType,
            serviceLogId: serviceLogId);
    }

    /// <summary>
    /// Factory for biometric authentication telemetry.
    /// </summary>
    public static TelemetryEvent ForBiometricAuth(
        bool success,
        string protectedAction,
        int authDurationMs,
        Guid? userId = null,
        string? deviceId = null,
        string? appVersion = null,
        string? platform = null)
    {
        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            success,
            protectedAction,
            authDurationMs
        });

        return Create(
            eventType: TelemetryEventType.BiometricAuth,
            userId: userId,
            deviceId: deviceId,
            actionLatencyMs: authDurationMs,
            jsonPayload: payload,
            appVersion: appVersion,
            platform: platform);
    }

    /// <summary>
    /// Factory for offline sync telemetry.
    /// </summary>
    public static TelemetryEvent ForOfflineSync(
        int commandsSynced,
        int syncDurationMs,
        bool success,
        string? errorMessage = null,
        Guid? userId = null,
        string? deviceId = null,
        string? appVersion = null,
        string? platform = null,
        string? networkType = null)
    {
        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            commandsSynced,
            success,
            errorMessage
        });

        return Create(
            eventType: TelemetryEventType.OfflineSync,
            userId: userId,
            deviceId: deviceId,
            actionLatencyMs: syncDurationMs,
            jsonPayload: payload,
            appVersion: appVersion,
            platform: platform,
            networkType: networkType);
    }

    /// <summary>
    /// Factory for mobile error telemetry.
    /// </summary>
    public static TelemetryEvent ForMobileError(
        string errorType,
        string errorMessage,
        string? stackTrace = null,
        Guid? userId = null,
        string? deviceId = null,
        GeoCoordinate? location = null,
        string? appVersion = null,
        string? platform = null,
        string? osVersion = null)
    {
        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            errorType,
            errorMessage,
            stackTrace
        });

        return Create(
            eventType: TelemetryEventType.MobileError,
            userId: userId,
            deviceId: deviceId,
            location: location,
            jsonPayload: payload,
            appVersion: appVersion,
            platform: platform,
            osVersion: osVersion);
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
