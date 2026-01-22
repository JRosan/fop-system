using FopSystem.Application.Interfaces;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FopSystem.Infrastructure.BackgroundJobs;

public class InsuranceExpiryMonitoringJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<InsuranceExpiryMonitoringJob> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(24);

    // Warning thresholds in days
    private static readonly int[] WarningThresholds = [30, 14, 7];

    public InsuranceExpiryMonitoringJob(
        IServiceProvider serviceProvider,
        ILogger<InsuranceExpiryMonitoringJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Insurance Expiry Monitoring Job started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Calculate time until next 12:00 AM AST (UTC-4)
                var now = DateTime.UtcNow;
                var astOffset = TimeSpan.FromHours(-4);
                var astNow = now.Add(astOffset);
                var nextRun = astNow.Date.AddDays(1); // Tomorrow at midnight AST
                var delay = (nextRun - astNow);

                if (delay > TimeSpan.Zero)
                {
                    _logger.LogDebug("Next insurance expiry check scheduled in {Delay}", delay);
                    await Task.Delay(delay, stoppingToken);
                }

                await CheckInsuranceExpiriesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Insurance Expiry Monitoring Job");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("Insurance Expiry Monitoring Job stopped");
    }

    private async Task CheckInsuranceExpiriesAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting insurance expiry check");

        using var scope = _serviceProvider.CreateScope();
        var permitRepository = scope.ServiceProvider.GetRequiredService<IPermitRepository>();
        var operatorRepository = scope.ServiceProvider.GetRequiredService<IOperatorRepository>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Check for expired permits and update status
        var expiredPermits = await permitRepository.GetExpiredPermitsAsync(today, cancellationToken);
        foreach (var permit in expiredPermits)
        {
            permit.Expire();
            _logger.LogInformation("Permit {PermitNumber} has expired", permit.PermitNumber);
        }

        if (expiredPermits.Count > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Send warning emails for permits expiring within thresholds
        foreach (var threshold in WarningThresholds)
        {
            var expiringPermits = await permitRepository.GetExpiringPermitsAsync(today, threshold, cancellationToken);

            foreach (var permit in expiringPermits)
            {
                var daysUntilExpiry = permit.DaysUntilExpiry(today);

                // Only send email if days match threshold exactly (to avoid duplicate emails)
                if (daysUntilExpiry == threshold || daysUntilExpiry == 7 || daysUntilExpiry == 1)
                {
                    var @operator = await operatorRepository.GetByIdAsync(permit.OperatorId, cancellationToken);
                    if (@operator is not null)
                    {
                        try
                        {
                            await emailService.SendInsuranceExpiryWarningEmailAsync(
                                @operator.ContactInfo.Email,
                                permit.PermitNumber,
                                permit.ValidUntil,
                                daysUntilExpiry,
                                cancellationToken);

                            _logger.LogInformation(
                                "Sent {DaysUntilExpiry}-day expiry warning for permit {PermitNumber} to {Email}",
                                daysUntilExpiry, permit.PermitNumber, @operator.ContactInfo.Email);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex,
                                "Failed to send expiry warning for permit {PermitNumber}",
                                permit.PermitNumber);
                        }
                    }
                }
            }
        }

        _logger.LogInformation("Completed insurance expiry check. Expired: {ExpiredCount}", expiredPermits.Count);
    }
}
