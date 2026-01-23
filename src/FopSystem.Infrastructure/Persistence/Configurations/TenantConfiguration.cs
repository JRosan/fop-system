using FopSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Subdomain)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.LogoUrl)
            .HasMaxLength(500);

        builder.Property(t => t.PrimaryColor)
            .IsRequired()
            .HasMaxLength(7)
            .HasDefaultValue("#1E3A5F");

        builder.Property(t => t.SecondaryColor)
            .IsRequired()
            .HasMaxLength(7)
            .HasDefaultValue("#F4A460");

        builder.Property(t => t.ContactEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(t => t.ContactPhone)
            .HasMaxLength(50);

        builder.Property(t => t.TimeZone)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("America/Tortola");

        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(t => t.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.UpdatedAt);

        // Unique indexes
        builder.HasIndex(t => t.Code)
            .IsUnique()
            .HasDatabaseName("IX_Tenants_Code");

        builder.HasIndex(t => t.Subdomain)
            .IsUnique()
            .HasDatabaseName("IX_Tenants_Subdomain");

        // Index for active tenant lookups
        builder.HasIndex(t => t.IsActive)
            .HasDatabaseName("IX_Tenants_IsActive");
    }
}
