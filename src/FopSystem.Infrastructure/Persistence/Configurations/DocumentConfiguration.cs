using FopSystem.Domain.Aggregates.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FopSystem.Infrastructure.Persistence.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<ApplicationDocument>
{
    public void Configure(EntityTypeBuilder<ApplicationDocument> builder)
    {
        builder.ToTable("ApplicationDocuments");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(d => d.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(d => d.FileSize)
            .IsRequired();

        builder.Property(d => d.MimeType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.BlobUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(d => d.VerifiedBy)
            .HasMaxLength(100);

        builder.Property(d => d.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(d => d.UploadedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(d => d.ApplicationId);
        builder.HasIndex(d => new { d.ApplicationId, d.Type });
    }
}
