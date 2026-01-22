using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Exceptions;

namespace FopSystem.Domain.Aggregates.Application;

public class ApplicationDocument : Entity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public DocumentType Type { get; private set; }
    public string FileName { get; private set; } = default!;
    public long FileSize { get; private set; }
    public string MimeType { get; private set; } = default!;
    public string BlobUrl { get; private set; } = default!;
    public DocumentStatus Status { get; private set; }
    public DateOnly? ExpiryDate { get; private set; }
    public DateTime? VerifiedAt { get; private set; }
    public string? VerifiedBy { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime UploadedAt { get; private set; }
    public string UploadedBy { get; private set; } = default!;

    private ApplicationDocument() { }

    public static ApplicationDocument Create(
        Guid applicationId,
        DocumentType type,
        string fileName,
        long fileSize,
        string mimeType,
        string blobUrl,
        string uploadedBy,
        DateOnly? expiryDate = null)
    {
        if (applicationId == Guid.Empty)
            throw new ArgumentException("Application ID is required", nameof(applicationId));
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name is required", nameof(fileName));
        if (fileSize <= 0)
            throw new ArgumentException("File size must be positive", nameof(fileSize));
        if (string.IsNullOrWhiteSpace(mimeType))
            throw new ArgumentException("MIME type is required", nameof(mimeType));
        if (string.IsNullOrWhiteSpace(blobUrl))
            throw new ArgumentException("Blob URL is required", nameof(blobUrl));
        if (string.IsNullOrWhiteSpace(uploadedBy))
            throw new ArgumentException("Uploaded by is required", nameof(uploadedBy));

        return new ApplicationDocument
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            Type = type,
            FileName = fileName.Trim(),
            FileSize = fileSize,
            MimeType = mimeType.Trim(),
            BlobUrl = blobUrl,
            Status = DocumentStatus.Pending,
            ExpiryDate = expiryDate,
            UploadedAt = DateTime.UtcNow,
            UploadedBy = uploadedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Verify(string verifiedBy)
    {
        if (string.IsNullOrWhiteSpace(verifiedBy))
            throw new ArgumentException("Verified by is required", nameof(verifiedBy));

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Check if document is expired
        if (IsExpired(today))
        {
            throw new DocumentExpiredException(Type, ExpiryDate!.Value);
        }

        Status = DocumentStatus.Verified;
        VerifiedAt = DateTime.UtcNow;
        VerifiedBy = verifiedBy;
        RejectionReason = null;
        SetUpdatedAt();
    }

    /// <summary>
    /// Checks if the document is expiring within the specified number of days.
    /// </summary>
    public bool IsExpiringSoon(DateOnly asOfDate, int warningDays = 30) =>
        ExpiryDate.HasValue &&
        !IsExpired(asOfDate) &&
        ExpiryDate.Value <= asOfDate.AddDays(warningDays);

    /// <summary>
    /// Gets the number of days until expiry, or null if no expiry date.
    /// </summary>
    public int? DaysUntilExpiry(DateOnly asOfDate) =>
        ExpiryDate.HasValue ? ExpiryDate.Value.DayNumber - asOfDate.DayNumber : null;

    public void Reject(string rejectionReason, string rejectedBy)
    {
        if (string.IsNullOrWhiteSpace(rejectionReason))
            throw new ArgumentException("Rejection reason is required", nameof(rejectionReason));
        if (string.IsNullOrWhiteSpace(rejectedBy))
            throw new ArgumentException("Rejected by is required", nameof(rejectedBy));

        Status = DocumentStatus.Rejected;
        RejectionReason = rejectionReason;
        VerifiedAt = DateTime.UtcNow;
        VerifiedBy = rejectedBy;
        SetUpdatedAt();
    }

    public void MarkExpired()
    {
        Status = DocumentStatus.Expired;
        SetUpdatedAt();
    }

    public bool IsExpired(DateOnly asOfDate) =>
        ExpiryDate.HasValue && asOfDate > ExpiryDate.Value;
}
