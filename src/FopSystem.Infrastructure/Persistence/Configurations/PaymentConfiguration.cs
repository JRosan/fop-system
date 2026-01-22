using FopSystem.Domain.Aggregates.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<ApplicationPayment>
{
    public void Configure(EntityTypeBuilder<ApplicationPayment> builder)
    {
        builder.ToTable("ApplicationPayments");

        builder.HasKey(p => p.Id);

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

        builder.Property(p => p.ReceiptNumber)
            .HasMaxLength(50);

        builder.Property(p => p.ReceiptUrl)
            .HasMaxLength(500);

        builder.Property(p => p.FailureReason)
            .HasMaxLength(500);

        // Verification fields
        builder.Property(p => p.IsVerified)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(p => p.VerifiedBy)
            .HasMaxLength(100);

        builder.Property(p => p.VerificationNotes)
            .HasMaxLength(1000);

        builder.HasIndex(p => p.ApplicationId)
            .IsUnique();

        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.IsVerified);
    }
}
