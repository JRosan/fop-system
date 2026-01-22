using FopSystem.Domain.Entities;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Application;

public enum WaiverType
{
    Emergency = 1,
    Humanitarian = 2,
    Government = 3,
    Diplomatic = 4,
    Military = 5,
    Other = 99
}

public enum WaiverStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public class FeeWaiver : Entity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public WaiverType Type { get; private set; }
    public WaiverStatus Status { get; private set; }
    public string Reason { get; private set; } = default!;
    public string RequestedBy { get; private set; } = default!;
    public DateTime RequestedAt { get; private set; }

    public Money? WaivedAmount { get; private set; }
    public decimal? WaiverPercentage { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public string? RejectedBy { get; private set; }
    public DateTime? RejectedAt { get; private set; }
    public string? RejectionReason { get; private set; }

    private FeeWaiver() { }

    public static FeeWaiver Create(
        Guid applicationId,
        WaiverType type,
        string reason,
        string requestedBy)
    {
        if (applicationId == Guid.Empty)
            throw new ArgumentException("Application ID is required", nameof(applicationId));
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason is required", nameof(reason));
        if (string.IsNullOrWhiteSpace(requestedBy))
            throw new ArgumentException("Requested by is required", nameof(requestedBy));

        return new FeeWaiver
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            Type = type,
            Status = WaiverStatus.Pending,
            Reason = reason,
            RequestedBy = requestedBy,
            RequestedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Approve(string approvedBy, Money waivedAmount, decimal waiverPercentage)
    {
        if (Status != WaiverStatus.Pending)
            throw new InvalidOperationException($"Cannot approve waiver in {Status} status");
        if (string.IsNullOrWhiteSpace(approvedBy))
            throw new ArgumentException("Approved by is required", nameof(approvedBy));
        if (waiverPercentage < 0 || waiverPercentage > 100)
            throw new ArgumentException("Waiver percentage must be between 0 and 100", nameof(waiverPercentage));

        Status = WaiverStatus.Approved;
        ApprovedBy = approvedBy;
        ApprovedAt = DateTime.UtcNow;
        WaivedAmount = waivedAmount;
        WaiverPercentage = waiverPercentage;
        SetUpdatedAt();
    }

    public void Reject(string rejectedBy, string rejectionReason)
    {
        if (Status != WaiverStatus.Pending)
            throw new InvalidOperationException($"Cannot reject waiver in {Status} status");
        if (string.IsNullOrWhiteSpace(rejectedBy))
            throw new ArgumentException("Rejected by is required", nameof(rejectedBy));
        if (string.IsNullOrWhiteSpace(rejectionReason))
            throw new ArgumentException("Rejection reason is required", nameof(rejectionReason));

        Status = WaiverStatus.Rejected;
        RejectedBy = rejectedBy;
        RejectedAt = DateTime.UtcNow;
        RejectionReason = rejectionReason;
        SetUpdatedAt();
    }
}
