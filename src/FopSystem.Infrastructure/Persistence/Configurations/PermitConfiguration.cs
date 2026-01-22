using FopSystem.Domain.Aggregates.Permit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class PermitConfiguration : IEntityTypeConfiguration<Permit>
{
    public void Configure(EntityTypeBuilder<Permit> builder)
    {
        builder.ToTable("Permits");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.PermitNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.PermitNumber)
            .IsUnique();

        builder.Property(p => p.ApplicationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(p => p.OperatorName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.AircraftRegistration)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.ValidFrom)
            .IsRequired();

        builder.Property(p => p.ValidUntil)
            .IsRequired();

        builder.Property(p => p.IssuedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.OwnsOne(p => p.FeesPaid, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("FeesPaidAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("FeesPaidCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(p => p.DocumentUrl)
            .HasMaxLength(500);

        builder.Property(p => p.RevocationReason)
            .HasMaxLength(1000);

        builder.Property(p => p.SuspensionReason)
            .HasMaxLength(1000);

        builder.Property(p => p.Conditions)
            .HasConversion(
                v => string.Join("||", v),
                v => v.Split("||", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(4000);

        builder.HasIndex(p => p.ApplicationId);
        builder.HasIndex(p => p.OperatorId);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.ValidUntil);
    }
}
