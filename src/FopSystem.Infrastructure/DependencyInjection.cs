using Azure.Identity;
using Azure.Storage.Blobs;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Repositories;
using FopSystem.Infrastructure.BackgroundJobs;
using FopSystem.Infrastructure.Persistence;
using FopSystem.Infrastructure.Persistence.Repositories;
using FopSystem.Infrastructure.Persistence.Seeders;
using FopSystem.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FopSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<FopDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
            });
        });

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<FopDbContext>());

        // Repositories
        services.AddScoped<IApplicationRepository, ApplicationRepository>();
        services.AddScoped<IOperatorRepository, OperatorRepository>();
        services.AddScoped<IAircraftRepository, AircraftRepository>();
        services.AddScoped<IPermitRepository, PermitRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IFeeConfigurationRepository, FeeConfigurationRepository>();

        // BVIAA Revenue Repositories
        services.AddScoped<IBviaInvoiceRepository, BviaInvoiceRepository>();
        services.AddScoped<IBviaFeeRateRepository, BviaFeeRateRepository>();
        services.AddScoped<IOperatorAccountBalanceRepository, OperatorAccountBalanceRepository>();

        // Azure Blob Storage
        var storageConnectionString = configuration["AzureStorage:ConnectionString"];
        if (!string.IsNullOrEmpty(storageConnectionString))
        {
            services.AddSingleton(_ => new BlobServiceClient(storageConnectionString));
        }
        else
        {
            var storageAccountName = configuration["AzureStorage:AccountName"];
            if (!string.IsNullOrEmpty(storageAccountName))
            {
                services.AddSingleton(_ => new BlobServiceClient(
                    new Uri($"https://{storageAccountName}.blob.core.windows.net"),
                    new DefaultAzureCredential()));
            }
        }

        services.AddScoped<IBlobStorageService, BlobStorageService>();

        // Email Service
        services.Configure<EmailSettings>(configuration.GetSection("Email"));
        services.AddScoped<IEmailService, EmailService>();

        // Officer Notification Service
        services.Configure<OfficerNotificationSettings>(configuration.GetSection("OfficerNotifications"));
        services.AddScoped<IOfficerNotificationService, OfficerNotificationService>();

        // Background Jobs
        services.AddHostedService<InsuranceExpiryMonitoringJob>();
        services.AddHostedService<InvoiceOverdueProcessingJob>();

        // Data Seeders
        services.AddScoped<BviaFeeRateSeeder>();
        services.AddScoped<SampleDataSeeder>();

        return services;
    }
}
