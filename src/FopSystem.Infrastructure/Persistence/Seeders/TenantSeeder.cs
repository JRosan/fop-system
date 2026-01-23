using FopSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FopSystem.Infrastructure.Persistence.Seeders;

/// <summary>
/// Seeds the default BVI tenant and any required initial tenants.
/// </summary>
public class TenantSeeder
{
    private readonly FopDbContext _context;
    private readonly ILogger<TenantSeeder> _logger;

    /// <summary>
    /// The default BVI tenant ID. Used for migration of existing data.
    /// </summary>
    public static readonly Guid DefaultBviTenantId = new("00000000-0000-0000-0000-000000000001");

    public TenantSeeder(FopDbContext context, ILogger<TenantSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the default BVI tenant if it doesn't exist.
    /// </summary>
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var bviTenantExists = await _context.Tenants
            .IgnoreQueryFilters()
            .AnyAsync(t => t.Id == DefaultBviTenantId, cancellationToken);

        if (bviTenantExists)
        {
            _logger.LogInformation("Default BVI tenant already exists, skipping seeding");
            return;
        }

        _logger.LogInformation("Creating default BVI tenant");

        var bviTenant = CreateBviTenant();
        await _context.Tenants.AddAsync(bviTenant, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Default BVI tenant created successfully with ID {TenantId}", bviTenant.Id);
    }

    /// <summary>
    /// Seeds a sample tenant for testing purposes.
    /// </summary>
    public async Task SeedSampleTenantsAsync(CancellationToken cancellationToken = default)
    {
        await SeedAsync(cancellationToken);

        // Check if sample tenants exist
        var anguillaCode = "AXA";
        var caymanCode = "CAY";

        var existingTenants = await _context.Tenants
            .IgnoreQueryFilters()
            .Where(t => t.Code == anguillaCode || t.Code == caymanCode)
            .Select(t => t.Code)
            .ToListAsync(cancellationToken);

        if (!existingTenants.Contains(anguillaCode))
        {
            var anguilla = Tenant.Create(
                code: anguillaCode,
                name: "Anguilla Air Services",
                subdomain: "anguilla",
                contactEmail: "aviation@gov.ai",
                logoUrl: null,
                primaryColor: "#0066CC",
                secondaryColor: "#FFCC00",
                contactPhone: "+1-264-497-2511",
                timeZone: "America/Anguilla",
                currency: "XCD"
            );

            // Use reflection to set the ID since it's a sample/test scenario
            typeof(Tenant).GetProperty("Id")?.SetValue(anguilla, Guid.NewGuid());

            await _context.Tenants.AddAsync(anguilla, cancellationToken);
            _logger.LogInformation("Created sample Anguilla tenant");
        }

        if (!existingTenants.Contains(caymanCode))
        {
            var cayman = Tenant.Create(
                code: caymanCode,
                name: "Cayman Islands Civil Aviation Authority",
                subdomain: "cayman",
                contactEmail: "aviation@caacayman.com",
                logoUrl: null,
                primaryColor: "#003366",
                secondaryColor: "#DC143C",
                contactPhone: "+1-345-949-8092",
                timeZone: "America/Cayman",
                currency: "KYD"
            );

            await _context.Tenants.AddAsync(cayman, cancellationToken);
            _logger.LogInformation("Created sample Cayman Islands tenant");
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private static Tenant CreateBviTenant()
    {
        var tenant = Tenant.Create(
            code: "BVI",
            name: "British Virgin Islands Civil Aviation Department",
            subdomain: "bvi",
            contactEmail: "aviation@bvi.gov.vg",
            logoUrl: null,
            primaryColor: "#1E3A5F",
            secondaryColor: "#F4A460",
            contactPhone: "+1-284-494-3701",
            timeZone: "America/Tortola",
            currency: "USD"
        );

        // Set the known ID for the default tenant using reflection
        // This ensures existing data can be migrated to this tenant
        var idProperty = typeof(Tenant).GetProperty("Id");
        idProperty?.SetValue(tenant, DefaultBviTenantId);

        return tenant;
    }

    /// <summary>
    /// Migrates existing data to the default BVI tenant.
    /// This should be called after the tenant is seeded and during migration.
    /// </summary>
    public async Task MigrateExistingDataToDefaultTenantAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Migrating existing data to default BVI tenant");

        // Note: This uses raw SQL for performance on large datasets
        // The migrations should handle this, but this is a fallback

        var tenantId = DefaultBviTenantId;

        // Update Applications
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE Applications SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update Operators
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE Operators SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update Aircraft
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE Aircraft SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update Permits
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE Permits SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update Users
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE Users SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update AuditLogs
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE AuditLogs SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update FeeConfigurations
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE FeeConfigurations SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update BviaInvoices
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE BviaInvoices SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update BviaFeeRates
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE BviaFeeRates SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        // Update OperatorAccountBalances
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE OperatorAccountBalances SET TenantId = {0} WHERE TenantId = '00000000-0000-0000-0000-000000000000'",
            [tenantId], cancellationToken);

        _logger.LogInformation("Completed migrating existing data to default BVI tenant");
    }
}
