using FopSystem.Domain.Aggregates.Revenue;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class BviaFeeRateConfiguration : IEntityTypeConfiguration<BviaFeeRate>
{
    public void Configure(EntityTypeBuilder<BviaFeeRate> builder)
    {
        builder.ToTable("BviaFeeRates");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Category)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(r => r.OperationType)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(r => r.Airport)
            .HasConversion<string>();

        builder.Property(r => r.MtowTier)
            .HasConversion<string>();

        builder.OwnsOne(r => r.Rate, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("RateAmount")
                .HasPrecision(18, 4)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("RateCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(r => r.IsPerUnit)
            .IsRequired();

        builder.Property(r => r.UnitDescription)
            .HasMaxLength(100);

        builder.OwnsOne(r => r.MinimumFee, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("MinimumFeeAmount")
                .HasPrecision(18, 2);

            m.Property(x => x.Currency)
                .HasColumnName("MinimumFeeCurrency")
                .HasConversion<string>()
                .HasMaxLength(3);
        });

        builder.Property(r => r.EffectiveFrom)
            .IsRequired();

        builder.Property(r => r.EffectiveTo);

        builder.Property(r => r.Description)
            .HasMaxLength(500);

        builder.Property(r => r.IsActive)
            .IsRequired();

        builder.HasIndex(r => new { r.Category, r.OperationType, r.Airport, r.MtowTier, r.EffectiveFrom });
        builder.HasIndex(r => r.IsActive);

        builder.Ignore(r => r.DomainEvents);
    }
}
