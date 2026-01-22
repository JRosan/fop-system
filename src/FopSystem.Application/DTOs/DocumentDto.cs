using FopSystem.Domain.Enums;

namespace FopSystem.Application.DTOs;

public sealed record DocumentDto(
    Guid Id,
    Guid ApplicationId,
    DocumentType Type,
    string FileName,
    long FileSize,
    string MimeType,
    string BlobUrl,
    DocumentStatus Status,
    DateOnly? ExpiryDate,
    DateTime? VerifiedAt,
    string? VerifiedBy,
    string? RejectionReason,
    DateTime UploadedAt,
    string UploadedBy);

public sealed record DocumentSummaryDto(
    Guid Id,
    DocumentType Type,
    string FileName,
    DocumentStatus Status,
    DateOnly? ExpiryDate,
    DateTime UploadedAt);
