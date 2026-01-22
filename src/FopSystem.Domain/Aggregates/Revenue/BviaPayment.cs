using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Revenue;

public class BviaPayment : Entity<Guid>
{
    public Guid InvoiceId { get; private set; }
    public Money Amount { get; private set; } = default!;
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }

    public string? TransactionReference { get; private set; }
    public DateTime? PaymentDate { get; private set; }
    public string? ReceiptNumber { get; private set; }
    public string? Notes { get; private set; }

    public string? RecordedBy { get; private set; }
    public DateTime? RecordedAt { get; private set; }

    private BviaPayment() { }

    public static BviaPayment Create(
        Guid invoiceId,
        Money amount,
        PaymentMethod method,
        string? transactionReference,
        string? notes,
        string recordedBy)
    {
        if (invoiceId == Guid.Empty)
            throw new ArgumentException("Invoice ID is required", nameof(invoiceId));
        if (amount.Amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        if (string.IsNullOrWhiteSpace(recordedBy))
            throw new ArgumentException("Recorded by is required", nameof(recordedBy));

        return new BviaPayment
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoiceId,
            Amount = amount,
            Method = method,
            Status = PaymentStatus.Completed,
            TransactionReference = transactionReference,
            PaymentDate = DateTime.UtcNow,
            ReceiptNumber = GenerateReceiptNumber(),
            Notes = notes,
            RecordedBy = recordedBy,
            RecordedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static string GenerateReceiptNumber()
    {
        return $"BVIA-RCP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
    }

    public void Refund(string refundedBy, string reason)
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException($"Cannot refund payment in {Status} status");

        if (string.IsNullOrWhiteSpace(refundedBy))
            throw new ArgumentException("Refunded by is required", nameof(refundedBy));
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Refund reason is required", nameof(reason));

        Status = PaymentStatus.Refunded;
        Notes = $"{Notes}\nRefunded by {refundedBy} on {DateTime.UtcNow:yyyy-MM-dd}: {reason}".Trim();
        SetUpdatedAt();
    }
}
