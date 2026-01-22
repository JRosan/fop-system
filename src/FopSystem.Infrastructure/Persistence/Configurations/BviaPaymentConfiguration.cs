using FopSystem.Domain.Aggregates.Revenue;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class BviaPaymentConfiguration : IEntityTypeConfiguration<BviaPayment>
{
    public void Configure(EntityTypeBuilder<BviaPayment> builder)
    {
        builder.ToTable("BviaPayments");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.InvoiceId)
            .IsRequired();

        builder.OwnsOne(p => p.Amount, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("Amount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("Currency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(p => p.Method)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(p => p.TransactionReference)
            .HasMaxLength(100);

        builder.Property(p => p.PaymentDate);

        builder.Property(p => p.ReceiptNumber)
            .HasMaxLength(50);

        builder.Property(p => p.Notes)
            .HasMaxLength(1000);

        builder.Property(p => p.RecordedBy)
            .HasMaxLength(100);

        builder.Property(p => p.RecordedAt);

        builder.HasIndex(p => p.InvoiceId);
    }
}
