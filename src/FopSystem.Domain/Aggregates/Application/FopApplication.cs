using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Application;

public class FopApplication : AggregateRoot<Guid>
{
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

    private readonly List<ApplicationDocument> _documents = [];
    public IReadOnlyList<ApplicationDocument> Documents => _documents.AsReadOnly();

    private ApplicationPayment? _payment;
    public ApplicationPayment? Payment => _payment;

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

        document.Verify(verifiedBy);
        SetUpdatedAt();

        RaiseDomainEvent(new DocumentVerifiedEvent(Id, documentId, document.Type, verifiedBy));

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

    private void EnsureStatus(ApplicationStatus expectedStatus)
    {
        if (Status != expectedStatus)
            throw new InvalidOperationException(
                $"Operation not allowed. Expected status: {expectedStatus}, actual: {Status}");
    }
}
