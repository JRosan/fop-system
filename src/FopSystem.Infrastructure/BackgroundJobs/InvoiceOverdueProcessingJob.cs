using FopSystem.Application.Interfaces;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FopSystem.Infrastructure.BackgroundJobs;

public class InvoiceOverdueProcessingJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<InvoiceOverdueProcessingJob> _logger;

    public InvoiceOverdueProcessingJob(
        IServiceProvider serviceProvider,
        ILogger<InvoiceOverdueProcessingJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Invoice Overdue Processing Job started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Calculate time until next 1:00 AM AST (UTC-4)
                var now = DateTime.UtcNow;
                var astOffset = TimeSpan.FromHours(-4);
                var astNow = now.Add(astOffset);
                var nextRun = astNow.Date.AddDays(1).AddHours(1); // Tomorrow at 1 AM AST
                var delay = (nextRun - astNow);

                if (delay > TimeSpan.Zero)
                {
                    _logger.LogDebug("Next invoice overdue check scheduled in {Delay}", delay);
                    await Task.Delay(delay, stoppingToken);
                }

                await ProcessOverdueInvoicesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Invoice Overdue Processing Job");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("Invoice Overdue Processing Job stopped");
    }

    private async Task ProcessOverdueInvoicesAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting invoice overdue processing");

        using var scope = _serviceProvider.CreateScope();
        var invoiceRepository = scope.ServiceProvider.GetRequiredService<IBviaInvoiceRepository>();
        var accountBalanceRepository = scope.ServiceProvider.GetRequiredService<IOperatorAccountBalanceRepository>();
        var operatorRepository = scope.ServiceProvider.GetRequiredService<IOperatorRepository>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var feeCalculationService = scope.ServiceProvider.GetRequiredService<IBviaFeeCalculationService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var overdueCount = 0;
        var interestChargedCount = 0;

        // Get invoices that are past due but not yet marked as overdue
        var invoicesDueForOverdue = await invoiceRepository.GetInvoicesDueForOverdueProcessingAsync(
            today, cancellationToken);

        foreach (var invoice in invoicesDueForOverdue)
        {
            try
            {
                // Mark as overdue
                invoice.MarkOverdue();
                overdueCount++;

                // Update operator account balance
                var accountBalance = await accountBalanceRepository.GetOrCreateAsync(
                    invoice.OperatorId, cancellationToken);
                accountBalance.RecordInvoiceOverdue(invoice.BalanceDue);

                // Send overdue notification
                var @operator = await operatorRepository.GetByIdAsync(invoice.OperatorId, cancellationToken);
                if (@operator is not null)
                {
                    try
                    {
                        await emailService.SendBviaInvoiceOverdueEmailAsync(
                            @operator.ContactInfo.Email,
                            invoice.InvoiceNumber,
                            invoice.BalanceDue.Amount,
                            invoice.DaysOverdue,
                            cancellationToken);

                        _logger.LogInformation(
                            "Sent overdue notification for invoice {InvoiceNumber} to {Email}",
                            invoice.InvoiceNumber, @operator.ContactInfo.Email);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Failed to send overdue notification for invoice {InvoiceNumber}",
                            invoice.InvoiceNumber);
                    }
                }

                _logger.LogInformation(
                    "Invoice {InvoiceNumber} marked as overdue ({DaysOverdue} days)",
                    invoice.InvoiceNumber, invoice.DaysOverdue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error processing overdue status for invoice {InvoiceNumber}",
                    invoice.InvoiceNumber);
            }
        }

        // Calculate and apply interest charges for invoices overdue more than 30 days
        var overdueInvoices = await invoiceRepository.GetOverdueInvoicesAsync(today, cancellationToken);

        foreach (var invoice in overdueInvoices)
        {
            try
            {
                // Only charge interest if overdue more than 30 days
                if (invoice.DaysOverdue > 30)
                {
                    // Calculate interest: 1.5% per month on outstanding balance
                    var interest = feeCalculationService.CalculateInterest(
                        invoice.BalanceDue,
                        invoice.DaysOverdue);

                    if (interest.Amount > 0)
                    {
                        // Check if we already charged interest this month
                        var lastInterestCharge = invoice.LineItems
                            .Where(li => li.IsInterestCharge)
                            .OrderByDescending(li => li.CreatedAt)
                            .FirstOrDefault();

                        var shouldChargeInterest = lastInterestCharge is null ||
                            (DateTime.UtcNow - lastInterestCharge.CreatedAt).TotalDays >= 30;

                        if (shouldChargeInterest)
                        {
                            var monthsOverdue = (invoice.DaysOverdue - 30) / 30 + 1;
                            var description = $"Late Payment Interest (1.5%/month) - Month {monthsOverdue}";

                            invoice.AddInterestCharge(interest, description);

                            // Update operator account balance
                            var accountBalance = await accountBalanceRepository.GetOrCreateAsync(
                                invoice.OperatorId, cancellationToken);
                            accountBalance.RecordInterestCharge(interest);

                            interestChargedCount++;

                            _logger.LogInformation(
                                "Applied interest charge of {Amount} to invoice {InvoiceNumber}",
                                interest, invoice.InvoiceNumber);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error applying interest to invoice {InvoiceNumber}",
                    invoice.InvoiceNumber);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Completed invoice overdue processing. Marked overdue: {OverdueCount}, Interest charged: {InterestCount}",
            overdueCount, interestChargedCount);
    }
}
