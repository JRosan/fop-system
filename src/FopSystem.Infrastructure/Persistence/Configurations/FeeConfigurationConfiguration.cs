using FopSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class FeeConfigurationConfiguration : IEntityTypeConfiguration<FeeConfiguration>
{
    public void Configure(EntityTypeBuilder<FeeConfiguration> builder)
    {
        builder.ToTable("FeeConfigurations");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.TenantId)
            .IsRequired();

        builder.Property(f => f.BaseFeeUsd)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(f => f.PerSeatFeeUsd)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(f => f.PerKgFeeUsd)
            .HasPrecision(18, 6)
            .IsRequired();

        builder.Property(f => f.OneTimeMultiplier)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(f => f.BlanketMultiplier)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(f => f.EmergencyMultiplier)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(f => f.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(f => f.ModifiedBy)
            .HasMaxLength(256);

        builder.Property(f => f.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(f => f.TenantId);
        builder.HasIndex(f => f.IsActive);
        builder.HasIndex(f => f.EffectiveFrom);
        builder.HasIndex(f => f.EffectiveTo);
        builder.HasIndex(f => new { f.TenantId, f.IsActive });
    }
}
