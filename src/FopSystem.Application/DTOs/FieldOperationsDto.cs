using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

// Airport Service Log DTOs
public sealed record AirportServiceLogDto(
    Guid Id,
    string LogNumber,
    Guid? PermitId,
    string? PermitNumber,
    Guid OperatorId,
    string? AircraftRegistration,
    Guid OfficerId,
    string OfficerName,
    AirportServiceType ServiceType,
    string ServiceDescription,
    MoneyDto FeeAmount,
    decimal Quantity,
    string? QuantityUnit,
    MoneyDto UnitRate,
    GeoCoordinateDto? Location,
    BviAirport Airport,
    DateTime LoggedAt,
    string? Notes,
    AirportServiceLogStatus Status,
    Guid? InvoiceId,
    string? InvoiceNumber,
    DateTime? InvoicedAt,
    bool WasOfflineLog,
    DateTime? SyncedAt);

public sealed record AirportServiceLogSummaryDto(
    Guid Id,
    string LogNumber,
    string? PermitNumber,
    string? AircraftRegistration,
    AirportServiceType ServiceType,
    MoneyDto FeeAmount,
    BviAirport Airport,
    DateTime LoggedAt,
    AirportServiceLogStatus Status);

public sealed record CreateServiceLogRequest(
    Guid? PermitId,
    string? PermitNumber,
    Guid OperatorId,
    string? AircraftRegistration,
    AirportServiceType ServiceType,
    decimal Quantity,
    string? QuantityUnit,
    BviAirport Airport,
    double? Latitude,
    double? Longitude,
    double? Accuracy,
    string? Notes,
    bool WasOfflineLog = false,
    string? DeviceId = null);

// Field Verification Log DTOs
public sealed record FieldVerificationLogDto(
    Guid Id,
    Guid? PermitId,
    string ScannedPermitNumber,
    string? PermitNumber,
    Guid? OperatorId,
    string? OperatorName,
    string? AircraftRegistration,
    Guid OfficerId,
    string OfficerName,
    VerificationResult Result,
    string? FailureReason,
    GeoCoordinateDto? Location,
    BviAirport? Airport,
    DateTime VerifiedAt,
    int ScanDurationMs,
    bool WasOfflineVerification,
    DateTime? SyncedAt);

public sealed record VerifyPermitRequest(
    string QrContent,
    double? Latitude,
    double? Longitude,
    double? Accuracy,
    BviAirport? Airport,
    string? DeviceId,
    int ScanDurationMs = 0);

public sealed record VerifyPermitResponse(
    bool IsValid,
    VerificationResult Result,
    string? FailureReason,
    PermitVerificationDetailsDto? PermitDetails);

public sealed record PermitVerificationDetailsDto(
    Guid PermitId,
    string PermitNumber,
    string OperatorName,
    string AircraftRegistration,
    DateOnly ValidFrom,
    DateOnly ValidUntil,
    PermitStatus Status,
    int DaysUntilExpiry);

// GeoCoordinate DTO
public sealed record GeoCoordinateDto(
    double Latitude,
    double Longitude,
    double? Altitude = null,
    double? Accuracy = null);

// Offline Sync DTOs
public sealed record SyncOfflineDataRequest(
    List<OfflineServiceLogCommand> ServiceLogs,
    List<OfflineVerificationCommand> Verifications,
    string DeviceId);

public sealed record OfflineServiceLogCommand(
    string OfflineId,
    Guid? PermitId,
    string? PermitNumber,
    Guid OperatorId,
    string? AircraftRegistration,
    AirportServiceType ServiceType,
    decimal Quantity,
    string? QuantityUnit,
    BviAirport Airport,
    double? Latitude,
    double? Longitude,
    DateTime LoggedAt,
    string? Notes);

public sealed record OfflineVerificationCommand(
    string OfflineId,
    string QrContent,
    VerificationResult Result,
    string? FailureReason,
    double? Latitude,
    double? Longitude,
    DateTime VerifiedAt,
    int ScanDurationMs,
    BviAirport? Airport);

public sealed record SyncOfflineDataResponse(
    int ServiceLogsSynced,
    int VerificationsSynced,
    List<string> Errors,
    DateTime SyncedAt);

// JWT Token DTOs
public sealed record PermitQrTokenDto(
    string Token,
    DateTime ExpiresAt,
    string PermitNumber,
    string QrCodeData);

// Cache DTOs for offline mobile
public sealed record CachedPermitDto(
    Guid PermitId,
    string PermitNumber,
    Guid OperatorId,
    string OperatorName,
    string AircraftRegistration,
    DateOnly ValidFrom,
    DateOnly ValidUntil,
    PermitStatus Status,
    string JwtToken,
    DateTime TokenExpiresAt);

public sealed record CachedFeeRateDto(
    AirportServiceType ServiceType,
    decimal Rate,
    bool IsPerUnit,
    string? UnitDescription,
    string Description);

// Telemetry DTOs
public sealed record LogTelemetryRequest(
    TelemetryEventType EventType,
    double? Latitude,
    double? Longitude,
    BviAirport? Airport,
    int? ActionLatencyMs,
    string? JsonPayload,
    string? DeviceId,
    string? SessionId,
    string? AppVersion,
    string? Platform,
    string? OsVersion,
    string? NetworkType,
    Guid? PermitId,
    Guid? ServiceLogId,
    Guid? VerificationLogId);

// PermitIssuanceEligibilityDto is defined in OperatorAccountStatusDto.cs
