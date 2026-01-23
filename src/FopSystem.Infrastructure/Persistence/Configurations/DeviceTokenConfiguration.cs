using FopSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class DeviceTokenConfiguration : IEntityTypeConfiguration<DeviceToken>
{
    public void Configure(EntityTypeBuilder<DeviceToken> builder)
    {
        builder.ToTable("DeviceTokens");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.UserId)
            .IsRequired();

        builder.Property(d => d.Token)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.Platform)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(d => d.DeviceId)
            .HasMaxLength(200);

        builder.Property(d => d.RegisteredAt)
            .IsRequired();

        builder.Property(d => d.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(d => d.TenantId)
            .IsRequired();

        // Index for efficient lookups
        builder.HasIndex(d => d.Token);
        builder.HasIndex(d => d.UserId);
        builder.HasIndex(d => new { d.UserId, d.IsActive });
        builder.HasIndex(d => d.TenantId);
    }
}
