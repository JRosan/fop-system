using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Application;

public class ApplicationPayment : Entity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public Money Amount { get; private set; } = default!;
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string? TransactionReference { get; private set; }
    public DateTime? PaymentDate { get; private set; }
    public string? ReceiptNumber { get; private set; }
    public string? ReceiptUrl { get; private set; }
    public string? FailureReason { get; private set; }

    // Finance officer verification
    public bool IsVerified { get; private set; }
    public string? VerifiedBy { get; private set; }
    public DateTime? VerifiedAt { get; private set; }
    public string? VerificationNotes { get; private set; }

    private ApplicationPayment() { }

    public static ApplicationPayment Create(
        Guid applicationId,
        Money amount,
        PaymentMethod method)
    {
        if (applicationId == Guid.Empty)
            throw new ArgumentException("Application ID is required", nameof(applicationId));
        if (amount.Amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        return new ApplicationPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            Amount = Money.Create(amount.Amount, amount.Currency), // Create new instance to avoid EF Core tracking conflict
            Method = method,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void MarkProcessing()
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException($"Cannot process payment in {Status} status");

        Status = PaymentStatus.Processing;
        SetUpdatedAt();
    }

    public void Complete(string transactionReference, string receiptNumber, string? receiptUrl = null)
    {
        if (Status != PaymentStatus.Processing && Status != PaymentStatus.Pending)
            throw new InvalidOperationException($"Cannot complete payment in {Status} status");

        if (string.IsNullOrWhiteSpace(transactionReference))
            throw new ArgumentException("Transaction reference is required", nameof(transactionReference));
        if (string.IsNullOrWhiteSpace(receiptNumber))
            throw new ArgumentException("Receipt number is required", nameof(receiptNumber));

        Status = PaymentStatus.Completed;
        TransactionReference = transactionReference;
        ReceiptNumber = receiptNumber;
        ReceiptUrl = receiptUrl;
        PaymentDate = DateTime.UtcNow;
        FailureReason = null;
        SetUpdatedAt();
    }

    public void Fail(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Failure reason is required", nameof(reason));

        Status = PaymentStatus.Failed;
        FailureReason = reason;
        SetUpdatedAt();
    }

    public void Refund()
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException($"Cannot refund payment in {Status} status");

        Status = PaymentStatus.Refunded;
        SetUpdatedAt();
    }

    public void Cancel()
    {
        if (Status == PaymentStatus.Completed || Status == PaymentStatus.Refunded)
            throw new InvalidOperationException($"Cannot cancel payment in {Status} status");

        Status = PaymentStatus.Cancelled;
        SetUpdatedAt();
    }

    /// <summary>
    /// Finance officer verifies the payment receipt has been received and is valid.
    /// </summary>
    public void Verify(string verifiedBy, string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(verifiedBy))
            throw new ArgumentException("Verified by is required", nameof(verifiedBy));

        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException($"Cannot verify payment in {Status} status. Payment must be completed first.");

        if (IsVerified)
            throw new InvalidOperationException("Payment has already been verified");

        IsVerified = true;
        VerifiedBy = verifiedBy;
        VerifiedAt = DateTime.UtcNow;
        VerificationNotes = notes;
        SetUpdatedAt();
    }
}
