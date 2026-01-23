using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.ToTable("SubscriptionPlans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Tier)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(500)
            .IsRequired();

        builder.OwnsOne(x => x.MonthlyPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("MonthlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();
            money.Property(m => m.Currency)
                .HasColumnName("MonthlyPriceCurrency")
                .IsRequired();
        });

        builder.OwnsOne(x => x.AnnualPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("AnnualPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();
            money.Property(m => m.Currency)
                .HasColumnName("AnnualPriceCurrency")
                .IsRequired();
        });

        builder.Property(x => x.MaxUsers);
        builder.Property(x => x.MaxApplicationsPerMonth);
        builder.Property(x => x.IncludesCustomBranding);
        builder.Property(x => x.IncludesApiAccess);
        builder.Property(x => x.IncludesPrioritySupport);
        builder.Property(x => x.IncludesDedicatedManager);
        builder.Property(x => x.IncludesAdvancedAnalytics);
        builder.Property(x => x.IncludesSlaGuarantee);
        builder.Property(x => x.IsActive);
        builder.Property(x => x.DisplayOrder);

        builder.HasIndex(x => x.Tier).IsUnique();
        builder.HasIndex(x => x.IsActive);
    }
}
