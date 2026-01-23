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
    private bool _seeded;

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

            // Add an in-memory database for testing with isolated internal service provider
            services.AddDbContext<FopDbContext>((sp, options) =>
            {
                options.UseInMemoryDatabase(_databaseName);
                options.EnableSensitiveDataLogging();
                options.UseInternalServiceProvider(
                    new ServiceCollection()
                        .AddEntityFrameworkInMemoryDatabase()
                        .BuildServiceProvider());
            });
        });

        builder.UseEnvironment("Testing");
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        // Seed the database after host is created
        if (!_seeded)
        {
            using var scope = host.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FopDbContext>();

            // Ensure database is created
            context.Database.EnsureCreated();

            // Seed BVIA fee rates for tests
            var seeder = new BviaFeeRateSeeder(context, NullLogger<BviaFeeRateSeeder>.Instance);
            seeder.SeedAsync().GetAwaiter().GetResult();

            _seeded = true;
        }

        return host;
    }
}
