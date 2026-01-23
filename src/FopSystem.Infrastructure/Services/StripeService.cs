using FopSystem.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace FopSystem.Infrastructure.Services;

public class StripeSettings
{
    public string PublishableKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public bool Enabled { get; set; } = false;
}

public class StripeService : IStripeService
{
    private readonly StripeSettings _settings;
    private readonly ILogger<StripeService> _logger;

    public StripeService(
        IOptions<StripeSettings> settings,
        ILogger<StripeService> logger)
    {
        _settings = settings.Value;
        _logger = logger;

        // Configure Stripe with the secret key
        if (!string.IsNullOrEmpty(_settings.SecretKey))
        {
            StripeConfiguration.ApiKey = _settings.SecretKey;
        }
    }

    public async Task<CheckoutSessionResult> CreateSubscriptionCheckoutSessionAsync(
        Guid tenantId,
        Guid planId,
        long priceAmount,
        string currency,
        bool isAnnual,
        string successUrl,
        string cancelUrl,
        string? customerEmail = null,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            _logger.LogWarning("Stripe is disabled. Returning mock checkout session.");
            return new CheckoutSessionResult(
                SessionId: $"cs_mock_{Guid.NewGuid():N}",
                SessionUrl: successUrl, // Redirect directly to success in mock mode
                PaymentIntentId: $"pi_mock_{Guid.NewGuid():N}",
                CustomerId: null);
        }

        try
        {
            var options = new SessionCreateOptions
            {
                Mode = "subscription",
                SuccessUrl = successUrl + "?session_id={CHECKOUT_SESSION_ID}",
                CancelUrl = cancelUrl,
                CustomerEmail = customerEmail,
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = currency,
                            UnitAmount = priceAmount,
                            Recurring = new SessionLineItemPriceDataRecurringOptions
                            {
                                Interval = isAnnual ? "year" : "month"
                            },
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = isAnnual ? "FOP System - Annual Subscription" : "FOP System - Monthly Subscription",
                                Description = "BVI Foreign Operator Permit System subscription"
                            }
                        },
                        Quantity = 1
                    }
                ],
                Metadata = new Dictionary<string, string>
                {
                    ["tenantId"] = tenantId.ToString(),
                    ["planId"] = planId.ToString(),
                    ["isAnnual"] = isAnnual.ToString()
                },
                SubscriptionData = new SessionSubscriptionDataOptions
                {
                    Metadata = new Dictionary<string, string>
                    {
                        ["tenantId"] = tenantId.ToString(),
                        ["planId"] = planId.ToString()
                    }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

            _logger.LogInformation(
                "Created Stripe checkout session {SessionId} for tenant {TenantId}",
                session.Id,
                tenantId);

            return new CheckoutSessionResult(
                SessionId: session.Id,
                SessionUrl: session.Url,
                PaymentIntentId: session.PaymentIntentId,
                CustomerId: session.CustomerId);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error creating checkout session for tenant {TenantId}", tenantId);
            throw new InvalidOperationException($"Failed to create checkout session: {ex.Message}", ex);
        }
    }

    public async Task<string> CreatePortalSessionAsync(
        string stripeCustomerId,
        string returnUrl,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            _logger.LogWarning("Stripe is disabled. Returning mock portal URL.");
            return returnUrl;
        }

        try
        {
            var options = new Stripe.BillingPortal.SessionCreateOptions
            {
                Customer = stripeCustomerId,
                ReturnUrl = returnUrl
            };

            var service = new Stripe.BillingPortal.SessionService();
            var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

            return session.Url;
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error creating portal session for customer {CustomerId}", stripeCustomerId);
            throw new InvalidOperationException($"Failed to create portal session: {ex.Message}", ex);
        }
    }

    public async Task<StripeSubscriptionInfo?> GetSubscriptionAsync(
        string subscriptionId,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            _logger.LogWarning("Stripe is disabled. Returning null subscription.");
            return null;
        }

        try
        {
            var service = new SubscriptionService();
            var subscription = await service.GetAsync(subscriptionId, cancellationToken: cancellationToken);

            return new StripeSubscriptionInfo(
                SubscriptionId: subscription.Id,
                CustomerId: subscription.CustomerId,
                Status: subscription.Status,
                CurrentPeriodStart: subscription.CurrentPeriodStart,
                CurrentPeriodEnd: subscription.CurrentPeriodEnd,
                CancelAtPeriodEnd: subscription.CancelAtPeriodEnd,
                PlanId: subscription.Items.Data.FirstOrDefault()?.Price?.Id,
                PriceAmount: subscription.Items.Data.FirstOrDefault()?.Price?.UnitAmount,
                Currency: subscription.Currency);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error getting subscription {SubscriptionId}", subscriptionId);
            return null;
        }
    }

    public async Task CancelSubscriptionAsync(
        string subscriptionId,
        bool cancelAtPeriodEnd = true,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            _logger.LogWarning("Stripe is disabled. Skipping subscription cancellation.");
            return;
        }

        try
        {
            var service = new SubscriptionService();

            if (cancelAtPeriodEnd)
            {
                await service.UpdateAsync(subscriptionId, new SubscriptionUpdateOptions
                {
                    CancelAtPeriodEnd = true
                }, cancellationToken: cancellationToken);

                _logger.LogInformation("Subscription {SubscriptionId} set to cancel at period end", subscriptionId);
            }
            else
            {
                await service.CancelAsync(subscriptionId, cancellationToken: cancellationToken);
                _logger.LogInformation("Subscription {SubscriptionId} canceled immediately", subscriptionId);
            }
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error canceling subscription {SubscriptionId}", subscriptionId);
            throw new InvalidOperationException($"Failed to cancel subscription: {ex.Message}", ex);
        }
    }

    public bool VerifyWebhookSignature(string payload, string signature)
    {
        if (!_settings.Enabled || string.IsNullOrEmpty(_settings.WebhookSecret))
        {
            _logger.LogWarning("Stripe webhooks not configured. Skipping signature verification.");
            return true; // Allow in development
        }

        try
        {
            EventUtility.ConstructEvent(payload, signature, _settings.WebhookSecret);
            return true;
        }
        catch (StripeException)
        {
            return false;
        }
    }

    public StripeWebhookEvent ParseWebhookEvent(string payload, string signature)
    {
        if (!_settings.Enabled || string.IsNullOrEmpty(_settings.WebhookSecret))
        {
            // Parse without signature verification in development
            var devEvent = EventUtility.ParseEvent(payload);
            return new StripeWebhookEvent(
                EventId: devEvent.Id,
                EventType: devEvent.Type,
                Data: devEvent.Data.Object,
                Created: devEvent.Created);
        }

        var stripeEvent = EventUtility.ConstructEvent(payload, signature, _settings.WebhookSecret);

        return new StripeWebhookEvent(
            EventId: stripeEvent.Id,
            EventType: stripeEvent.Type,
            Data: stripeEvent.Data.Object,
            Created: stripeEvent.Created);
    }
}
