using FopSystem.Domain.Aggregates.Revenue;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class BviaInvoiceLineItemConfiguration : IEntityTypeConfiguration<BviaInvoiceLineItem>
{
    public void Configure(EntityTypeBuilder<BviaInvoiceLineItem> builder)
    {
        builder.ToTable("BviaInvoiceLineItems");

        builder.HasKey(li => li.Id);

        builder.Property(li => li.InvoiceId)
            .IsRequired();

        builder.Property(li => li.Category)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(li => li.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(li => li.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(li => li.QuantityUnit)
            .HasMaxLength(50);

        builder.OwnsOne(li => li.UnitRate, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("UnitRateAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("UnitRateCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(li => li.Amount, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("Amount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("AmountCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(li => li.FeeRateId);

        builder.Property(li => li.DisplayOrder)
            .IsRequired();

        builder.Property(li => li.IsInterestCharge)
            .IsRequired();

        builder.HasIndex(li => li.InvoiceId);
    }
}
