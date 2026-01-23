using FopSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class TelemetryEventConfiguration : IEntityTypeConfiguration<TelemetryEvent>
{
    public void Configure(EntityTypeBuilder<TelemetryEvent> builder)
    {
        builder.ToTable("TelemetryEvents");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasConversion<string>();

        builder.HasIndex(e => e.EventType);

        builder.Property(e => e.UserId);
        builder.HasIndex(e => e.UserId);

        builder.Property(e => e.DeviceId)
            .HasMaxLength(100);
        builder.HasIndex(e => e.DeviceId);

        builder.Property(e => e.SessionId)
            .HasMaxLength(100);

        // Location (owned GeoCoordinate)
        builder.OwnsOne(e => e.Location, g =>
        {
            g.Property(x => x.Latitude)
                .HasColumnName("LocationLatitude")
                .HasPrecision(10, 6);

            g.Property(x => x.Longitude)
                .HasColumnName("LocationLongitude")
                .HasPrecision(10, 6);

            g.Property(x => x.Altitude)
                .HasColumnName("LocationAltitude")
                .HasPrecision(10, 2);

            g.Property(x => x.Accuracy)
                .HasColumnName("LocationAccuracy")
                .HasPrecision(10, 2);
        });

        builder.Property(e => e.Airport)
            .HasConversion<string>();

        builder.Property(e => e.OccurredAt)
            .IsRequired();

        builder.HasIndex(e => e.OccurredAt);

        builder.Property(e => e.ActionLatencyMs);

        builder.Property(e => e.JsonPayload)
            .HasMaxLength(10000);

        builder.Property(e => e.AppVersion)
            .HasMaxLength(50);

        builder.Property(e => e.Platform)
            .HasMaxLength(50);

        builder.Property(e => e.OsVersion)
            .HasMaxLength(50);

        builder.Property(e => e.NetworkType)
            .HasMaxLength(50);

        builder.Property(e => e.PermitId);
        builder.Property(e => e.ServiceLogId);
        builder.Property(e => e.VerificationLogId);

        // Composite indexes for analytics queries
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => new { e.TenantId, e.EventType, e.OccurredAt });
        builder.HasIndex(e => new { e.TenantId, e.UserId, e.OccurredAt });
        builder.HasIndex(e => new { e.TenantId, e.DeviceId, e.OccurredAt });
    }
}
