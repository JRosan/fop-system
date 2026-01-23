using FopSystem.Domain.Aggregates.Field;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class FieldVerificationLogConfiguration : IEntityTypeConfiguration<FieldVerificationLog>
{
    public void Configure(EntityTypeBuilder<FieldVerificationLog> builder)
    {
        builder.ToTable("FieldVerificationLogs");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.PermitId);
        builder.HasIndex(l => l.PermitId);

        builder.Property(l => l.ScannedPermitNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.PermitNumber)
            .HasMaxLength(50);

        builder.Property(l => l.OperatorId);
        builder.HasIndex(l => l.OperatorId);

        builder.Property(l => l.OperatorName)
            .HasMaxLength(200);

        builder.Property(l => l.AircraftRegistration)
            .HasMaxLength(20);

        builder.Property(l => l.OfficerId)
            .IsRequired();
        builder.HasIndex(l => l.OfficerId);

        builder.Property(l => l.OfficerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.DeviceId)
            .HasMaxLength(100);

        builder.Property(l => l.Result)
            .IsRequired()
            .HasConversion<string>();

        builder.HasIndex(l => l.Result);

        builder.Property(l => l.FailureReason)
            .HasMaxLength(500);

        // Location (owned GeoCoordinate)
        builder.OwnsOne(l => l.Location, g =>
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

        builder.Property(l => l.Airport)
            .HasConversion<string>();

        builder.HasIndex(l => l.Airport);

        builder.Property(l => l.VerifiedAt)
            .IsRequired();

        builder.Property(l => l.ScanDurationMs)
            .IsRequired();

        builder.Property(l => l.WasOfflineVerification)
            .IsRequired();

        builder.Property(l => l.SyncedAt);

        builder.Property(l => l.RawQrContent)
            .HasMaxLength(5000);

        builder.Property(l => l.JwtTokenHash)
            .HasMaxLength(64);

        builder.Property(l => l.Notes)
            .HasMaxLength(2000);

        builder.Ignore(l => l.DomainEvents);

        // Composite indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.Result });
        builder.HasIndex(l => new { l.TenantId, l.OfficerId, l.VerifiedAt });
        builder.HasIndex(l => new { l.TenantId, l.VerifiedAt });
    }
}
