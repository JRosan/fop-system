using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Revenue;

public class BviaInvoiceLineItem : Entity<Guid>
{
    public Guid InvoiceId { get; private set; }
    public BviaFeeCategory Category { get; private set; }
    public string Description { get; private set; } = default!;

    public decimal Quantity { get; private set; }
    public string? QuantityUnit { get; private set; }
    public Money UnitRate { get; private set; } = default!;
    public Money Amount { get; private set; } = default!;

    public Guid? FeeRateId { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsInterestCharge { get; private set; }

    private BviaInvoiceLineItem() { }

    public static BviaInvoiceLineItem Create(
        Guid invoiceId,
        BviaFeeCategory category,
        string description,
        decimal quantity,
        string? quantityUnit,
        Money unitRate,
        int displayOrder,
        Guid? feeRateId = null)
    {
        if (invoiceId == Guid.Empty)
            throw new ArgumentException("Invoice ID is required", nameof(invoiceId));
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required", nameof(description));
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        var amount = unitRate.Multiply(quantity);

        return new BviaInvoiceLineItem
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoiceId,
            Category = category,
            Description = description,
            Quantity = quantity,
            QuantityUnit = quantityUnit,
            UnitRate = unitRate,
            Amount = amount,
            FeeRateId = feeRateId,
            DisplayOrder = displayOrder,
            IsInterestCharge = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static BviaInvoiceLineItem CreateInterestCharge(
        Guid invoiceId,
        string description,
        Money amount,
        int displayOrder)
    {
        if (invoiceId == Guid.Empty)
            throw new ArgumentException("Invoice ID is required", nameof(invoiceId));
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required", nameof(description));

        return new BviaInvoiceLineItem
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoiceId,
            Category = BviaFeeCategory.LatePaymentInterest,
            Description = description,
            Quantity = 1,
            QuantityUnit = null,
            UnitRate = amount,
            Amount = amount,
            FeeRateId = null,
            DisplayOrder = displayOrder,
            IsInterestCharge = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void UpdateAmount(Money newAmount)
    {
        Amount = newAmount;
        SetUpdatedAt();
    }
}
