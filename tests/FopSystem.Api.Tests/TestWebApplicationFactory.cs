using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using FopSystem.Infrastructure.Persistence;
using FopSystem.Infrastructure.Persistence.Seeders;

namespace FopSystem.Api.Tests;

public class TestWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    private static readonly string _databaseName = "TestDb_" + Guid.NewGuid();
    private static bool _seeded;
    private static readonly object _seedLock = new();

    // Shared internal service provider for in-memory database to ensure state is shared across test instances
    private static readonly IServiceProvider _internalServiceProvider = new ServiceCollection()
        .AddEntityFrameworkInMemoryDatabase()
        .BuildServiceProvider();

    /// <summary>
    /// The default test tenant ID (BVI tenant).
    /// </summary>
    public static readonly Guid TestTenantId = TenantSeeder.DefaultBviTenantId;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove ALL existing DbContext-related registrations including internal EF services
            var descriptorsToRemove = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<FopDbContext>) ||
                            d.ServiceType == typeof(DbContextOptions) ||
                            d.ServiceType == typeof(FopDbContext) ||
                            d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true)
                .ToList();

            foreach (var descriptor in descriptorsToRemove)
            {
                services.Remove(descriptor);
            }

            // Add an in-memory database for testing with shared internal service provider
            // This ensures all test instances share the same database state
            services.AddDbContext<FopDbContext>((sp, options) =>
            {
                options.UseInMemoryDatabase(_databaseName);
                options.EnableSensitiveDataLogging();
                options.UseInternalServiceProvider(_internalServiceProvider);
            });
        });

        builder.UseEnvironment("Testing");
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        // Thread-safe seeding of the shared database
        lock (_seedLock)
        {
            if (!_seeded)
            {
                using var scope = host.Services.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<FopDbContext>();

                // Ensure database is created
                context.Database.EnsureCreated();

                // Seed default BVI tenant first
                var tenantSeeder = new TenantSeeder(context, NullLogger<TenantSeeder>.Instance);
                tenantSeeder.SeedAsync().GetAwaiter().GetResult();

                // Seed BVIA fee rates for the test tenant
                var feeRateSeeder = new BviaFeeRateSeeder(context, NullLogger<BviaFeeRateSeeder>.Instance);
                feeRateSeeder.SeedAsync(TestTenantId).GetAwaiter().GetResult();

                _seeded = true;
            }
        }

        return host;
    }

    /// <summary>
    /// Creates an HttpClient with the X-Tenant-Id header set to the test tenant.
    /// </summary>
    public HttpClient CreateTenantClient()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TestTenantId.ToString());
        return client;
    }
}
