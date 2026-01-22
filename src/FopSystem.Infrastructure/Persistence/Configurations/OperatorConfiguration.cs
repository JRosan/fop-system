using FopSystem.Domain.Aggregates.Operator;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class OperatorConfiguration : IEntityTypeConfiguration<Operator>
{
    public void Configure(EntityTypeBuilder<Operator> builder)
    {
        builder.ToTable("Operators");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.TradingName)
            .HasMaxLength(200);

        builder.Property(o => o.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.RegistrationNumber)
            .IsUnique();

        builder.Property(o => o.Country)
            .IsRequired()
            .HasMaxLength(100);

        builder.OwnsOne(o => o.Address, a =>
        {
            a.Property(x => x.Street)
                .HasColumnName("AddressStreet")
                .IsRequired()
                .HasMaxLength(200);

            a.Property(x => x.City)
                .HasColumnName("AddressCity")
                .IsRequired()
                .HasMaxLength(100);

            a.Property(x => x.State)
                .HasColumnName("AddressState")
                .HasMaxLength(100);

            a.Property(x => x.PostalCode)
                .HasColumnName("AddressPostalCode")
                .HasMaxLength(20);

            a.Property(x => x.Country)
                .HasColumnName("AddressCountry")
                .IsRequired()
                .HasMaxLength(100);
        });

        builder.OwnsOne(o => o.ContactInfo, c =>
        {
            c.Property(x => x.Email)
                .HasColumnName("ContactEmail")
                .IsRequired()
                .HasMaxLength(200);

            c.Property(x => x.Phone)
                .HasColumnName("ContactPhone")
                .IsRequired()
                .HasMaxLength(50);

            c.Property(x => x.Fax)
                .HasColumnName("ContactFax")
                .HasMaxLength(50);
        });

        builder.OwnsOne(o => o.AuthorizedRepresentative, ar =>
        {
            ar.Property(x => x.Name)
                .HasColumnName("AuthRepName")
                .IsRequired()
                .HasMaxLength(200);

            ar.Property(x => x.Title)
                .HasColumnName("AuthRepTitle")
                .IsRequired()
                .HasMaxLength(100);

            ar.Property(x => x.Email)
                .HasColumnName("AuthRepEmail")
                .IsRequired()
                .HasMaxLength(200);

            ar.Property(x => x.Phone)
                .HasColumnName("AuthRepPhone")
                .IsRequired()
                .HasMaxLength(50);
        });

        builder.Property(o => o.AocNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.AocIssuingAuthority)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.AocExpiryDate)
            .IsRequired();

        builder.HasMany(o => o.Aircraft)
            .WithOne()
            .HasForeignKey(a => a.OperatorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.Country);
        builder.HasIndex(o => o.AocExpiryDate);
    }
}
