using FopSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class PaymentIntentConfiguration : IEntityTypeConfiguration<PaymentIntent>
{
    public void Configure(EntityTypeBuilder<PaymentIntent> builder)
    {
        builder.ToTable("PaymentIntents");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.StripePaymentIntentId)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(p => p.StripeCheckoutSessionId)
            .HasMaxLength(255);

        builder.Property(p => p.StripeCustomerId)
            .HasMaxLength(255);

        builder.Property(p => p.StripeSubscriptionId)
            .HasMaxLength(255);

        builder.Property(p => p.Amount)
            .IsRequired();

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.PaymentType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.Metadata)
            .HasColumnType("nvarchar(max)");

        builder.Property(p => p.ErrorMessage)
            .HasMaxLength(1000);

        builder.Property(p => p.TenantId)
            .IsRequired();

        // Indexes
        builder.HasIndex(p => p.StripePaymentIntentId);
        builder.HasIndex(p => p.StripeCheckoutSessionId);
        builder.HasIndex(p => p.StripeCustomerId);
        builder.HasIndex(p => p.StripeSubscriptionId);
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.CreatedAt);
    }
}
