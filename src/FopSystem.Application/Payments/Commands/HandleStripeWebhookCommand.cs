using System.Text.Json;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace FopSystem.Application.Payments.Commands;

/// <summary>
/// Command to process a Stripe webhook event.
/// </summary>
public record HandleStripeWebhookCommand(
    string Payload,
    string Signature) : IRequest<HandleStripeWebhookResult>;

/// <summary>
/// Result of processing a Stripe webhook.
/// </summary>
public record HandleStripeWebhookResult(
    bool Success,
    string? Message = null);

public class HandleStripeWebhookCommandHandler
    : IRequestHandler<HandleStripeWebhookCommand, HandleStripeWebhookResult>
{
    private readonly IStripeService _stripeService;
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<HandleStripeWebhookCommandHandler> _logger;

    public HandleStripeWebhookCommandHandler(
        IStripeService stripeService,
        ITenantRepository tenantRepository,
        ISubscriptionPlanRepository planRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        ILogger<HandleStripeWebhookCommandHandler> logger)
    {
        _stripeService = stripeService;
        _tenantRepository = tenantRepository;
        _planRepository = planRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<HandleStripeWebhookResult> Handle(
        HandleStripeWebhookCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verify webhook signature
            if (!_stripeService.VerifyWebhookSignature(request.Payload, request.Signature))
            {
                _logger.LogWarning("Invalid Stripe webhook signature");
                return new HandleStripeWebhookResult(false, "Invalid signature");
            }

            // Parse the webhook event
            var stripeEvent = _stripeService.ParseWebhookEvent(request.Payload, request.Signature);

            _logger.LogInformation(
                "Processing Stripe webhook event: {EventType} ({EventId})",
                stripeEvent.EventType,
                stripeEvent.EventId);

            // Handle different event types
            return stripeEvent.EventType switch
            {
                "checkout.session.completed" => await HandleCheckoutSessionCompleted(stripeEvent, cancellationToken),
                "customer.subscription.updated" => await HandleSubscriptionUpdated(stripeEvent, cancellationToken),
                "customer.subscription.deleted" => await HandleSubscriptionDeleted(stripeEvent, cancellationToken),
                "invoice.paid" => await HandleInvoicePaid(stripeEvent, cancellationToken),
                "invoice.payment_failed" => await HandleInvoicePaymentFailed(stripeEvent, cancellationToken),
                _ => new HandleStripeWebhookResult(true, $"Event type {stripeEvent.EventType} not handled")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Stripe webhook");
            return new HandleStripeWebhookResult(false, ex.Message);
        }
    }

    private async Task<HandleStripeWebhookResult> HandleCheckoutSessionCompleted(
        StripeWebhookEvent stripeEvent,
        CancellationToken cancellationToken)
    {
        var sessionData = JsonSerializer.Deserialize<CheckoutSessionData>(
            JsonSerializer.Serialize(stripeEvent.Data));

        if (sessionData == null)
        {
            return new HandleStripeWebhookResult(false, "Invalid session data");
        }

        // Parse metadata to get tenant and plan info
        var metadata = sessionData.Metadata;
        if (metadata == null ||
            !metadata.TryGetValue("tenantId", out var tenantIdStr) ||
            !Guid.TryParse(tenantIdStr, out var tenantId))
        {
            _logger.LogWarning("Missing tenantId in checkout session metadata");
            return new HandleStripeWebhookResult(false, "Missing tenant information");
        }

        // Get the tenant
        var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken);
        if (tenant == null)
        {
            _logger.LogWarning("Tenant {TenantId} not found", tenantId);
            return new HandleStripeWebhookResult(false, $"Tenant {tenantId} not found");
        }

        // Get the plan if specified
        SubscriptionTier tier = SubscriptionTier.Starter;
        bool isAnnual = false;

        if (metadata.TryGetValue("planTier", out var tierStr) &&
            Enum.TryParse<SubscriptionTier>(tierStr, true, out var parsedTier))
        {
            tier = parsedTier;
        }

        if (metadata.TryGetValue("isAnnual", out var isAnnualStr))
        {
            bool.TryParse(isAnnualStr, out isAnnual);
        }

        // Calculate subscription dates
        var startDate = DateTime.UtcNow;
        var endDate = isAnnual
            ? startDate.AddYears(1)
            : startDate.AddMonths(1);

        // Update tenant subscription
        tenant.UpdateSubscription(tier, isAnnual, startDate, endDate);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Send confirmation email
        await _emailService.SendSubscriptionConfirmationEmailAsync(
            tenant.ContactEmail,
            tenant.Name,
            tier.ToString(),
            isAnnual,
            endDate,
            cancellationToken);

        _logger.LogInformation(
            "Subscription activated for tenant {TenantId}: {Tier} ({Billing})",
            tenantId,
            tier,
            isAnnual ? "Annual" : "Monthly");

        return new HandleStripeWebhookResult(true, "Subscription activated");
    }

    private async Task<HandleStripeWebhookResult> HandleSubscriptionUpdated(
        StripeWebhookEvent stripeEvent,
        CancellationToken cancellationToken)
    {
        var subscriptionData = JsonSerializer.Deserialize<SubscriptionEventData>(
            JsonSerializer.Serialize(stripeEvent.Data));

        if (subscriptionData == null)
        {
            return new HandleStripeWebhookResult(false, "Invalid subscription data");
        }

        _logger.LogInformation(
            "Subscription {SubscriptionId} updated to status: {Status}",
            subscriptionData.Id,
            subscriptionData.Status);

        // If subscription becomes active, make sure tenant is updated
        if (subscriptionData.Status == "active" && subscriptionData.Metadata != null)
        {
            if (subscriptionData.Metadata.TryGetValue("tenantId", out var tenantIdStr) &&
                Guid.TryParse(tenantIdStr, out var tenantId))
            {
                var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken);
                if (tenant != null && !tenant.HasActiveSubscription())
                {
                    // Reactivate subscription
                    var endDate = DateTimeOffset.FromUnixTimeSeconds(subscriptionData.CurrentPeriodEnd).UtcDateTime;
                    tenant.UpdateSubscription(tenant.SubscriptionTier, tenant.IsAnnualBilling, DateTime.UtcNow, endDate);
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                }
            }
        }

        return new HandleStripeWebhookResult(true, "Subscription updated");
    }

    private async Task<HandleStripeWebhookResult> HandleSubscriptionDeleted(
        StripeWebhookEvent stripeEvent,
        CancellationToken cancellationToken)
    {
        var subscriptionData = JsonSerializer.Deserialize<SubscriptionEventData>(
            JsonSerializer.Serialize(stripeEvent.Data));

        if (subscriptionData?.Metadata == null)
        {
            return new HandleStripeWebhookResult(false, "Invalid subscription data");
        }

        if (subscriptionData.Metadata.TryGetValue("tenantId", out var tenantIdStr) &&
            Guid.TryParse(tenantIdStr, out var tenantId))
        {
            var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken);
            if (tenant != null)
            {
                // Downgrade to trial
                tenant.StartTrial(DateTime.UtcNow.AddDays(7));
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Subscription canceled for tenant {TenantId}", tenantId);
            }
        }

        return new HandleStripeWebhookResult(true, "Subscription canceled");
    }

    private async Task<HandleStripeWebhookResult> HandleInvoicePaid(
        StripeWebhookEvent stripeEvent,
        CancellationToken cancellationToken)
    {
        var invoiceData = JsonSerializer.Deserialize<InvoiceEventData>(
            JsonSerializer.Serialize(stripeEvent.Data));

        if (invoiceData == null)
        {
            return new HandleStripeWebhookResult(false, "Invalid invoice data");
        }

        _logger.LogInformation(
            "Invoice {InvoiceId} paid: {Amount} {Currency}",
            invoiceData.Id,
            invoiceData.AmountPaid,
            invoiceData.Currency);

        // Send payment receipt email if we have customer email
        if (!string.IsNullOrEmpty(invoiceData.CustomerEmail) &&
            !string.IsNullOrEmpty(invoiceData.Id) &&
            !string.IsNullOrEmpty(invoiceData.Currency))
        {
            await _emailService.SendPaymentReceiptEmailAsync(
                invoiceData.CustomerEmail,
                invoiceData.Id,
                invoiceData.AmountPaid / 100m, // Convert from cents
                invoiceData.Currency.ToUpperInvariant(),
                DateTime.UtcNow,
                cancellationToken);
        }

        return new HandleStripeWebhookResult(true, "Invoice payment recorded");
    }

    private Task<HandleStripeWebhookResult> HandleInvoicePaymentFailed(
        StripeWebhookEvent stripeEvent,
        CancellationToken cancellationToken)
    {
        var invoiceData = JsonSerializer.Deserialize<InvoiceEventData>(
            JsonSerializer.Serialize(stripeEvent.Data));

        _logger.LogWarning(
            "Invoice payment failed: {InvoiceId} for customer {CustomerEmail}",
            invoiceData?.Id,
            invoiceData?.CustomerEmail);

        // TODO: Send payment failure notification email

        return Task.FromResult(new HandleStripeWebhookResult(true, "Payment failure logged"));
    }

    // Helper classes for deserializing Stripe event data
    private class CheckoutSessionData
    {
        public string? Id { get; set; }
        public string? PaymentStatus { get; set; }
        public string? CustomerEmail { get; set; }
        public string? SubscriptionId { get; set; }
        public Dictionary<string, string>? Metadata { get; set; }
    }

    private class SubscriptionEventData
    {
        public string? Id { get; set; }
        public string? Status { get; set; }
        public long CurrentPeriodEnd { get; set; }
        public bool CancelAtPeriodEnd { get; set; }
        public Dictionary<string, string>? Metadata { get; set; }
    }

    private class InvoiceEventData
    {
        public string? Id { get; set; }
        public long AmountPaid { get; set; }
        public string? Currency { get; set; }
        public string? CustomerEmail { get; set; }
    }
}
