using FopSystem.Domain.Aggregates.Revenue;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class BviaInvoiceConfiguration : IEntityTypeConfiguration<BviaInvoice>
{
    public void Configure(EntityTypeBuilder<BviaInvoice> builder)
    {
        builder.ToTable("BviaInvoices");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(i => i.InvoiceNumber)
            .IsUnique();

        builder.Property(i => i.OperatorId)
            .IsRequired();

        builder.HasIndex(i => i.OperatorId);

        builder.Property(i => i.FopApplicationId);

        builder.HasIndex(i => i.FopApplicationId);

        builder.Property(i => i.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.HasIndex(i => i.Status);

        builder.Property(i => i.ArrivalAirport)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(i => i.DepartureAirport)
            .HasConversion<string>();

        builder.Property(i => i.OperationType)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(i => i.FlightDate)
            .IsRequired();

        builder.Property(i => i.AircraftRegistration)
            .HasMaxLength(20);

        builder.OwnsOne(i => i.Mtow, w =>
        {
            w.Property(x => x.Value)
                .HasColumnName("MtowValue")
                .HasPrecision(18, 2)
                .IsRequired();

            w.Property(x => x.Unit)
                .HasColumnName("MtowUnit")
                .HasConversion<string>()
                .HasMaxLength(10)
                .IsRequired();
        });

        builder.Property(i => i.SeatCount)
            .IsRequired();

        builder.Property(i => i.PassengerCount);

        builder.OwnsOne(i => i.Subtotal, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("SubtotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("SubtotalCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(i => i.TotalInterest, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("TotalInterestAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("TotalInterestCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(i => i.TotalAmount, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("TotalCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(i => i.AmountPaid, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("AmountPaidAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("AmountPaidCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(i => i.BalanceDue, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("BalanceDueAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("BalanceDueCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(i => i.InvoiceDate)
            .IsRequired();

        builder.Property(i => i.DueDate)
            .IsRequired();

        builder.HasIndex(i => i.DueDate);

        builder.Property(i => i.FinalizedBy)
            .HasMaxLength(100);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        // Navigation properties
        builder.HasMany(i => i.LineItems)
            .WithOne()
            .HasForeignKey(li => li.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.Payments)
            .WithOne()
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(i => i.DomainEvents);
    }
}
