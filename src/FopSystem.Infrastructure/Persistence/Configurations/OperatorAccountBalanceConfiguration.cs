using FopSystem.Domain.Aggregates.Revenue;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class OperatorAccountBalanceConfiguration : IEntityTypeConfiguration<OperatorAccountBalance>
{
    public void Configure(EntityTypeBuilder<OperatorAccountBalance> builder)
    {
        builder.ToTable("OperatorAccountBalances");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.OperatorId)
            .IsRequired();

        builder.HasIndex(b => b.OperatorId)
            .IsUnique();

        builder.OwnsOne(b => b.TotalInvoiced, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("TotalInvoicedAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("TotalInvoicedCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(b => b.TotalPaid, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("TotalPaidAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("TotalPaidCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(b => b.TotalInterest, m =>
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

        builder.OwnsOne(b => b.CurrentBalance, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("CurrentBalanceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("CurrentBalanceCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(b => b.TotalOverdue, m =>
        {
            m.Property(x => x.Amount)
                .HasColumnName("TotalOverdueAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Currency)
                .HasColumnName("TotalOverdueCurrency")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(b => b.InvoiceCount)
            .IsRequired();

        builder.Property(b => b.PaidInvoiceCount)
            .IsRequired();

        builder.Property(b => b.OverdueInvoiceCount)
            .IsRequired();

        builder.Property(b => b.LastInvoiceDate);

        builder.Property(b => b.LastPaymentDate);

        builder.Ignore(b => b.DomainEvents);
    }
}
