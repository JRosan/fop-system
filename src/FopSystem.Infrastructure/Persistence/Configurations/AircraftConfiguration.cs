using FopSystem.Domain.Aggregates.Aircraft;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class AircraftConfiguration : IEntityTypeConfiguration<Aircraft>
{
    public void Configure(EntityTypeBuilder<Aircraft> builder)
    {
        builder.ToTable("Aircraft");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.RegistrationMark)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(a => a.RegistrationMark)
            .IsUnique();

        builder.Property(a => a.Manufacturer)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Model)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.SerialNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Category)
            .IsRequired()
            .HasConversion<string>();

        builder.OwnsOne(a => a.Mtow, m =>
        {
            m.Property(x => x.Value)
                .HasColumnName("MtowValue")
                .HasPrecision(18, 2)
                .IsRequired();

            m.Property(x => x.Unit)
                .HasColumnName("MtowUnit")
                .HasConversion<string>()
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(a => a.SeatCount)
            .IsRequired();

        builder.Property(a => a.YearOfManufacture)
            .IsRequired();

        builder.Property(a => a.NoiseCategory)
            .HasMaxLength(20);

        builder.HasIndex(a => a.OperatorId);
    }
}
