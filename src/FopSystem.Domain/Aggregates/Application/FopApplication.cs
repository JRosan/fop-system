using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Application;

public class FopApplication : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string ApplicationNumber { get; private set; } = default!;
    public ApplicationType Type { get; private set; }
    public ApplicationStatus Status { get; private set; }

    public Guid OperatorId { get; private set; }
    public Guid AircraftId { get; private set; }

    public FlightDetails FlightDetails { get; private set; } = default!;
    public DateOnly RequestedStartDate { get; private set; }
    public DateOnly RequestedEndDate { get; private set; }

    public Money CalculatedFee { get; private set; } = default!;

    public DateTime? SubmittedAt { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public string? ReviewedBy { get; private set; }
    public string? ReviewNotes { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public string? ApprovedBy { get; private set; }
    public string? RejectionReason { get; private set; }

    // Fee override tracking
    public string? FeeOverrideJustification { get; private set; }
    public string? FeeOverriddenBy { get; private set; }
    public DateTime? FeeOverriddenAt { get; private set; }

    // Flagging for special review
    public bool IsFlagged { get; private set; }
    public string? FlagReason { get; private set; }
    public string? FlaggedBy { get; private set; }
    public DateTime? FlaggedAt { get; private set; }

    private readonly List<ApplicationDocument> _documents = [];
    public IReadOnlyList<ApplicationDocument> Documents => _documents.AsReadOnly();

    private ApplicationPayment? _payment;
    public ApplicationPayment? Payment => _payment;

    private readonly List<FeeWaiver> _waivers = [];
    public IReadOnlyList<FeeWaiver> Waivers => _waivers.AsReadOnly();

    // Navigation properties (set by EF Core)
    public Operator.Operator? Operator { get; private set; }
    public Aircraft.Aircraft? Aircraft { get; private set; }

    private FopApplication() { }

    public static FopApplication Create(
        ApplicationType type,
        Guid operatorId,
        Guid aircraftId,
        FlightDetails flightDetails,
        DateOnly requestedStartDate,
        DateOnly requestedEndDate,
        Money calculatedFee)
    {
        if (operatorId == Guid.Empty)
            throw new ArgumentException("Operator ID is required", nameof(operatorId));
        if (aircraftId == Guid.Empty)
            throw new ArgumentException("Aircraft ID is required", nameof(aircraftId));
        if (requestedEndDate < requestedStartDate)
            throw new ArgumentException("End date must be after start date");

        var application = new FopApplication
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = GenerateApplicationNumber(type),
            Type = type,
            Status = ApplicationStatus.Draft,
            OperatorId = operatorId,
            AircraftId = aircraftId,
            FlightDetails = flightDetails,
            RequestedStartDate = requestedStartDate,
            RequestedEndDate = requestedEndDate,
            CalculatedFee = calculatedFee,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        application.RaiseDomainEvent(new ApplicationCreatedEvent(
            application.Id,
            application.ApplicationNumber,
            type,
            operatorId,
            aircraftId));

        return application;
    }

    private static string GenerateApplicationNumber(ApplicationType type)
    {
        var prefix = type switch
        {
            ApplicationType.OneTime => "FOP-OT",
            ApplicationType.Blanket => "FOP-BL",
            ApplicationType.Emergency => "FOP-EM",
            _ => "FOP"
        };
        return $"{prefix}-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
    }

    public void UpdateFlightDetails(FlightDetails flightDetails)
    {
        EnsureStatus(ApplicationStatus.Draft);
        FlightDetails = flightDetails;
        SetUpdatedAt();
    }

    public void UpdateRequestedPeriod(DateOnly startDate, DateOnly endDate)
    {
        EnsureStatus(ApplicationStatus.Draft);
        if (endDate < startDate)
            throw new ArgumentException("End date must be after start date");

        RequestedStartDate = startDate;
        RequestedEndDate = endDate;
        SetUpdatedAt();
    }

    public void UpdateCalculatedFee(Money fee)
    {
        EnsureStatus(ApplicationStatus.Draft);
        CalculatedFee = fee;
        SetUpdatedAt();
    }

    public void AddDocument(ApplicationDocument document)
    {
        if (Status != ApplicationStatus.Draft && Status != ApplicationStatus.PendingDocuments)
            throw new InvalidOperationException($"Cannot add documents in {Status} status");

        var existingDoc = _documents.FirstOrDefault(d => d.Type == document.Type);
        if (existingDoc is not null)
        {
            _documents.Remove(existingDoc);
        }

        _documents.Add(document);
        SetUpdatedAt();
    }

    public void Submit()
    {
        EnsureStatus(ApplicationStatus.Draft);
        ValidateForSubmission();

        Status = ApplicationStatus.Submitted;
        SubmittedAt = DateTime.UtcNow;
        SetUpdatedAt();

        RaiseDomainEvent(new ApplicationSubmittedEvent(Id, ApplicationNumber, CalculatedFee));
    }

    private void ValidateForSubmission()
    {
        var requiredDocTypes = new[]
        {
            DocumentType.CertificateOfAirworthiness,
            DocumentType.CertificateOfRegistration,
            DocumentType.AirOperatorCertificate,
            DocumentType.InsuranceCertificate
        };

        var uploadedTypes = _documents.Select(d => d.Type).ToHashSet();
        var missing = requiredDocTypes.Where(t => !uploadedTypes.Contains(t)).ToList();

        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                $"Missing required documents: {string.Join(", ", missing)}");
        }
    }

    public void StartReview(string reviewerUserId)
    {
        EnsureStatus(ApplicationStatus.Submitted);

        if (string.IsNullOrWhiteSpace(reviewerUserId))
            throw new ArgumentException("Reviewer user ID is required", nameof(reviewerUserId));

        Status = ApplicationStatus.UnderReview;
        ReviewedBy = reviewerUserId;
        ReviewedAt = DateTime.UtcNow;
        SetUpdatedAt();

        RaiseDomainEvent(new ApplicationUnderReviewEvent(Id, reviewerUserId));
    }

    public void VerifyDocument(Guid documentId, string verifiedBy)
    {
        var document = _documents.FirstOrDefault(d => d.Id == documentId)
            ?? throw new InvalidOperationException($"Document {documentId} not found");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Check if document is expired before attempting verification
        if (document.IsExpired(today))
        {
            RaiseDomainEvent(new DocumentVerificationFailedDueToExpiryEvent(
                Id, documentId, document.Type, document.ExpiryDate!.Value, verifiedBy));
            throw new Exceptions.DocumentExpiredException(document.Type, document.ExpiryDate!.Value);
        }

        document.Verify(verifiedBy);
        SetUpdatedAt();

        RaiseDomainEvent(new DocumentVerifiedEvent(Id, documentId, document.Type, verifiedBy));

        // Warn if document is expiring soon (within 30 days)
        if (document.IsExpiringSoon(today, 30))
        {
            var daysUntilExpiry = document.DaysUntilExpiry(today)!.Value;
            RaiseDomainEvent(new DocumentExpiringSoonEvent(
                Id, documentId, document.Type, document.ExpiryDate!.Value, daysUntilExpiry));
        }

        if (AllDocumentsVerified() && Status == ApplicationStatus.PendingDocuments)
        {
            Status = ApplicationStatus.UnderReview;
        }
    }

    public void RejectDocument(Guid documentId, string reason, string rejectedBy)
    {
        var document = _documents.FirstOrDefault(d => d.Id == documentId)
            ?? throw new InvalidOperationException($"Document {documentId} not found");

        document.Reject(reason, rejectedBy);
        Status = ApplicationStatus.PendingDocuments;
        SetUpdatedAt();

        RaiseDomainEvent(new DocumentRejectedEvent(Id, documentId, document.Type, reason, rejectedBy));
    }

    public bool AllDocumentsVerified() =>
        _documents.All(d => d.Status == DocumentStatus.Verified);

    public void RequestPayment(PaymentMethod method)
    {
        if (Status != ApplicationStatus.UnderReview)
            throw new InvalidOperationException($"Cannot request payment in {Status} status");

        if (!AllDocumentsVerified())
            throw new InvalidOperationException("All documents must be verified before payment");

        _payment = ApplicationPayment.Create(Id, CalculatedFee, method);
        Status = ApplicationStatus.PendingPayment;
        SetUpdatedAt();
    }

    public void CompletePayment(string transactionReference, string receiptNumber, string? receiptUrl = null)
    {
        EnsureStatus(ApplicationStatus.PendingPayment);

        if (_payment is null)
            throw new InvalidOperationException("No payment exists for this application");

        _payment.Complete(transactionReference, receiptNumber, receiptUrl);
        SetUpdatedAt();

        RaiseDomainEvent(new PaymentCompletedEvent(Id, _payment.Id, _payment.Amount, transactionReference));
    }

    public void Approve(string approvedBy, string? notes = null)
    {
        if (Status != ApplicationStatus.PendingPayment && Status != ApplicationStatus.UnderReview)
            throw new InvalidOperationException($"Cannot approve application in {Status} status");

        if (_payment?.Status != PaymentStatus.Completed)
            throw new InvalidOperationException("Payment must be completed before approval");

        if (string.IsNullOrWhiteSpace(approvedBy))
            throw new ArgumentException("Approved by is required", nameof(approvedBy));

        Status = ApplicationStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
        ApprovedBy = approvedBy;
        ReviewNotes = notes;
        SetUpdatedAt();

        RaiseDomainEvent(new ApplicationApprovedEvent(Id, ApplicationNumber, approvedBy, notes));
    }

    public void Reject(string rejectedBy, string reason)
    {
        if (Status == ApplicationStatus.Approved || Status == ApplicationStatus.Rejected)
            throw new InvalidOperationException($"Cannot reject application in {Status} status");

        if (string.IsNullOrWhiteSpace(rejectedBy))
            throw new ArgumentException("Rejected by is required", nameof(rejectedBy));
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required", nameof(reason));

        Status = ApplicationStatus.Rejected;
        ReviewedBy = rejectedBy;
        RejectionReason = reason;
        SetUpdatedAt();

        RaiseDomainEvent(new ApplicationRejectedEvent(Id, ApplicationNumber, rejectedBy, reason));
    }

    public void Cancel()
    {
        if (Status == ApplicationStatus.Approved || Status == ApplicationStatus.Cancelled)
            throw new InvalidOperationException($"Cannot cancel application in {Status} status");

        Status = ApplicationStatus.Cancelled;
        _payment?.Cancel();
        SetUpdatedAt();
    }

    public void RefundPayment(string refundedBy, string reason)
    {
        if (_payment is null)
            throw new InvalidOperationException("No payment exists for this application");

        if (string.IsNullOrWhiteSpace(refundedBy))
            throw new ArgumentException("Refunded by is required", nameof(refundedBy));
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Refund reason is required", nameof(reason));

        var amount = _payment.Amount;
        _payment.Refund();
        SetUpdatedAt();

        RaiseDomainEvent(new Events.PaymentRefundedEvent(Id, _payment.Id, amount, refundedBy, reason));
    }

    public void OverrideFee(Money newFee, string overriddenBy, string justification)
    {
        if (Status != ApplicationStatus.Draft && Status != ApplicationStatus.UnderReview)
            throw new InvalidOperationException($"Cannot override fee in {Status} status");

        if (string.IsNullOrWhiteSpace(overriddenBy))
            throw new ArgumentException("Overridden by is required", nameof(overriddenBy));
        if (string.IsNullOrWhiteSpace(justification))
            throw new ArgumentException("Justification is required", nameof(justification));

        var originalFee = CalculatedFee;
        CalculatedFee = newFee;
        FeeOverrideJustification = justification;
        FeeOverriddenBy = overriddenBy;
        FeeOverriddenAt = DateTime.UtcNow;
        SetUpdatedAt();

        RaiseDomainEvent(new Events.FeeOverriddenEvent(Id, originalFee, newFee, overriddenBy, justification));
    }

    public FeeWaiver RequestWaiver(WaiverType type, string reason, string requestedBy)
    {
        if (Status != ApplicationStatus.Draft && Status != ApplicationStatus.UnderReview && Status != ApplicationStatus.PendingPayment)
            throw new InvalidOperationException($"Cannot request waiver in {Status} status");

        // Check if there's already a pending waiver
        var pendingWaiver = _waivers.FirstOrDefault(w => w.Status == WaiverStatus.Pending);
        if (pendingWaiver is not null)
            throw new InvalidOperationException("A pending waiver request already exists for this application");

        var waiver = FeeWaiver.Create(Id, type, reason, requestedBy);
        _waivers.Add(waiver);
        SetUpdatedAt();

        RaiseDomainEvent(new WaiverRequestedEvent(Id, waiver.Id, type.ToString(), requestedBy, reason));

        return waiver;
    }

    public void ApproveWaiver(Guid waiverId, string approvedBy, decimal waiverPercentage)
    {
        var waiver = _waivers.FirstOrDefault(w => w.Id == waiverId)
            ?? throw new InvalidOperationException($"Waiver {waiverId} not found");

        var waivedAmount = Money.Create(CalculatedFee.Amount * (waiverPercentage / 100), CalculatedFee.Currency);
        waiver.Approve(approvedBy, waivedAmount, waiverPercentage);

        // Adjust the calculated fee
        var newFee = CalculatedFee.Subtract(waivedAmount);
        CalculatedFee = newFee;
        SetUpdatedAt();

        RaiseDomainEvent(new WaiverApprovedEvent(Id, waiver.Id, approvedBy, waivedAmount));
    }

    public void RejectWaiver(Guid waiverId, string rejectedBy, string reason)
    {
        var waiver = _waivers.FirstOrDefault(w => w.Id == waiverId)
            ?? throw new InvalidOperationException($"Waiver {waiverId} not found");

        waiver.Reject(rejectedBy, reason);
        SetUpdatedAt();

        RaiseDomainEvent(new WaiverRejectedEvent(Id, waiver.Id, rejectedBy, reason));
    }

    public FeeWaiver? GetPendingWaiver() => _waivers.FirstOrDefault(w => w.Status == WaiverStatus.Pending);

    public void Flag(string reason, string flaggedBy)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Flag reason is required", nameof(reason));
        if (string.IsNullOrWhiteSpace(flaggedBy))
            throw new ArgumentException("Flagged by is required", nameof(flaggedBy));

        IsFlagged = true;
        FlagReason = reason;
        FlaggedBy = flaggedBy;
        FlaggedAt = DateTime.UtcNow;
        SetUpdatedAt();

        RaiseDomainEvent(new ApplicationFlaggedEvent(Id, reason, flaggedBy));
    }

    public void Unflag(string unflaggedBy)
    {
        if (!IsFlagged)
            throw new InvalidOperationException("Application is not flagged");
        if (string.IsNullOrWhiteSpace(unflaggedBy))
            throw new ArgumentException("Unflagged by is required", nameof(unflaggedBy));

        var previousReason = FlagReason;
        IsFlagged = false;
        FlagReason = null;
        FlaggedBy = null;
        FlaggedAt = null;
        SetUpdatedAt();

        RaiseDomainEvent(new ApplicationUnflaggedEvent(Id, previousReason!, unflaggedBy));
    }

    private void EnsureStatus(ApplicationStatus expectedStatus)
    {
        if (Status != expectedStatus)
            throw new InvalidOperationException(
                $"Operation not allowed. Expected status: {expectedStatus}, actual: {Status}");
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
