using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<FopApplication>
{
    public void Configure(EntityTypeBuilder<FopApplication> builder)
    {
        builder.ToTable("Applications");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.ApplicationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(a => a.ApplicationNumber)
            .IsUnique();

        builder.Property(a => a.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(a => a.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(a => a.RequestedStartDate)
            .IsRequired();

        builder.Property(a => a.RequestedEndDate)
            .IsRequired();

        builder.OwnsOne(a => a.FlightDetails, fd =>
        {
            fd.Property(f => f.Purpose)
                .HasColumnName("FlightPurpose")
                .IsRequired()
                .HasConversion<string>();

            fd.Property(f => f.PurposeDescription)
                .HasColumnName("FlightPurposeDescription")
                .HasMaxLength(500);

            fd.Property(f => f.ArrivalAirport)
                .HasColumnName("ArrivalAirport")
                .IsRequired()
                .HasMaxLength(10);

            fd.Property(f => f.DepartureAirport)
                .HasColumnName("DepartureAirport")
                .IsRequired()
                .HasMaxLength(10);

            fd.Property(f => f.EstimatedFlightDate)
                .HasColumnName("EstimatedFlightDate")
                .IsRequired();

            fd.Property(f => f.NumberOfPassengers)
                .HasColumnName("NumberOfPassengers");

            fd.Property(f => f.CargoDescription)
                .HasColumnName("CargoDescription")
                .HasMaxLength(1000);
        });

        builder.OwnsOne(a => a.CalculatedFee, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("CalculatedFeeAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("CalculatedFeeCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(a => a.ReviewedBy)
            .HasMaxLength(100);

        builder.Property(a => a.ReviewNotes)
            .HasMaxLength(2000);

        builder.Property(a => a.ApprovedBy)
            .HasMaxLength(100);

        builder.Property(a => a.RejectionReason)
            .HasMaxLength(2000);

        // Flagging fields
        builder.Property(a => a.IsFlagged)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.FlagReason)
            .HasMaxLength(2000);

        builder.Property(a => a.FlaggedBy)
            .HasMaxLength(100);

        builder.HasMany(a => a.Documents)
            .WithOne()
            .HasForeignKey(d => d.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Payment)
            .WithOne()
            .HasForeignKey<ApplicationPayment>(p => p.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Operator)
            .WithMany()
            .HasForeignKey(a => a.OperatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Aircraft)
            .WithMany()
            .HasForeignKey(a => a.AircraftId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Waivers)
            .WithOne()
            .HasForeignKey(w => w.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.OperatorId);
        builder.HasIndex(a => a.SubmittedAt);
        builder.HasIndex(a => a.IsFlagged);
    }
}
