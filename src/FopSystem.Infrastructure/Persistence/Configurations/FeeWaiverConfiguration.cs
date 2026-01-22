using FopSystem.Domain.Aggregates.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class FeeWaiverConfiguration : IEntityTypeConfiguration<FeeWaiver>
{
    public void Configure(EntityTypeBuilder<FeeWaiver> builder)
    {
        builder.ToTable("FeeWaivers");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.ApplicationId)
            .IsRequired();

        builder.Property(w => w.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(w => w.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(w => w.Reason)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(w => w.RequestedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.RequestedAt)
            .IsRequired();

        builder.OwnsOne(w => w.WaivedAmount, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("WaivedAmount")
                .HasPrecision(18, 2);

            m.Property(x => x.Currency)
                .HasColumnName("WaivedCurrency")
                .HasConversion<string>()
                .HasMaxLength(3);
        });

        builder.Property(w => w.WaiverPercentage)
            .HasPrecision(5, 2);

        builder.Property(w => w.ApprovedBy)
            .HasMaxLength(100);

        builder.Property(w => w.RejectedBy)
            .HasMaxLength(100);

        builder.Property(w => w.RejectionReason)
            .HasMaxLength(2000);

        builder.HasIndex(w => w.ApplicationId);
        builder.HasIndex(w => w.Status);
    }
}
