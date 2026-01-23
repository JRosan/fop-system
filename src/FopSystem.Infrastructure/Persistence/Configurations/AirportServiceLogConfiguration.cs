using FopSystem.Domain.Aggregates.Field;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class AirportServiceLogConfiguration : IEntityTypeConfiguration<AirportServiceLog>
{
    public void Configure(EntityTypeBuilder<AirportServiceLog> builder)
    {
        builder.ToTable("AirportServiceLogs");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.LogNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(l => l.LogNumber)
            .IsUnique();

        builder.Property(l => l.PermitId);
        builder.HasIndex(l => l.PermitId);

        builder.Property(l => l.PermitNumber)
            .HasMaxLength(50);

        builder.Property(l => l.OperatorId)
            .IsRequired();
        builder.HasIndex(l => l.OperatorId);

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

        builder.Property(l => l.ServiceType)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(l => l.ServiceDescription)
            .IsRequired()
            .HasMaxLength(500);

        // Fee Amount (owned Money)
        builder.OwnsOne(l => l.FeeAmount, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("FeeAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("FeeCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(l => l.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(l => l.QuantityUnit)
            .HasMaxLength(50);

        // Unit Rate (owned Money)
        builder.OwnsOne(l => l.UnitRate, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("UnitRateAmount")
                .HasPrecision(18, 4)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("UnitRateCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

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
            .IsRequired()
            .HasConversion<string>();

        builder.Property(l => l.LoggedAt)
            .IsRequired();

        builder.Property(l => l.Notes)
            .HasMaxLength(2000);

        builder.Property(l => l.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.HasIndex(l => l.Status);

        builder.Property(l => l.InvoiceId);
        builder.HasIndex(l => l.InvoiceId);

        builder.Property(l => l.InvoiceNumber)
            .HasMaxLength(50);

        builder.Property(l => l.InvoicedAt);

        builder.Property(l => l.WasOfflineLog)
            .IsRequired();

        builder.Property(l => l.SyncedAt);

        builder.Property(l => l.CancellationReason)
            .HasMaxLength(500);

        builder.Property(l => l.CancelledBy)
            .HasMaxLength(100);

        builder.Property(l => l.CancelledAt);

        builder.Ignore(l => l.DomainEvents);

        // Composite indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.Status });
        builder.HasIndex(l => new { l.TenantId, l.OperatorId });
        builder.HasIndex(l => new { l.TenantId, l.OfficerId, l.LoggedAt });
    }
}
