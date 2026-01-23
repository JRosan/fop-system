namespace FopSystem.Application.Interfaces;

/// <summary>
/// Service interface for Stripe payment processing.
/// </summary>
public interface IStripeService
{
    /// <summary>
    /// Creates a Stripe Checkout Session for subscription.
    /// </summary>
    /// <param name="tenantId">The tenant purchasing the subscription</param>
    /// <param name="planId">The subscription plan ID</param>
    /// <param name="priceAmount">Price in cents</param>
    /// <param name="currency">Currency code (e.g., "usd")</param>
    /// <param name="isAnnual">Whether this is annual billing</param>
    /// <param name="successUrl">URL to redirect on success</param>
    /// <param name="cancelUrl">URL to redirect on cancel</param>
    /// <param name="customerEmail">Customer email for receipt</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Checkout session details</returns>
    Task<CheckoutSessionResult> CreateSubscriptionCheckoutSessionAsync(
        Guid tenantId,
        Guid planId,
        long priceAmount,
        string currency,
        bool isAnnual,
        string successUrl,
        string cancelUrl,
        string? customerEmail = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a Stripe Customer Portal session for subscription management.
    /// </summary>
    /// <param name="stripeCustomerId">Stripe customer ID</param>
    /// <param name="returnUrl">URL to return to after portal session</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Portal session URL</returns>
    Task<string> CreatePortalSessionAsync(
        string stripeCustomerId,
        string returnUrl,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a Stripe subscription.
    /// </summary>
    /// <param name="subscriptionId">Stripe subscription ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Subscription details</returns>
    Task<StripeSubscriptionInfo?> GetSubscriptionAsync(
        string subscriptionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a Stripe subscription.
    /// </summary>
    /// <param name="subscriptionId">Stripe subscription ID</param>
    /// <param name="cancelAtPeriodEnd">Whether to cancel at period end or immediately</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task CancelSubscriptionAsync(
        string subscriptionId,
        bool cancelAtPeriodEnd = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifies a Stripe webhook signature.
    /// </summary>
    /// <param name="payload">Raw webhook payload</param>
    /// <param name="signature">Stripe-Signature header value</param>
    /// <returns>True if signature is valid</returns>
    bool VerifyWebhookSignature(string payload, string signature);

    /// <summary>
    /// Parses a Stripe webhook event.
    /// </summary>
    /// <param name="payload">Raw webhook payload</param>
    /// <param name="signature">Stripe-Signature header value</param>
    /// <returns>Parsed webhook event</returns>
    StripeWebhookEvent ParseWebhookEvent(string payload, string signature);
}

/// <summary>
/// Result from creating a Stripe Checkout session.
/// </summary>
public record CheckoutSessionResult(
    string SessionId,
    string SessionUrl,
    string? PaymentIntentId,
    string? CustomerId);

/// <summary>
/// Information about a Stripe subscription.
/// </summary>
public record StripeSubscriptionInfo(
    string SubscriptionId,
    string CustomerId,
    string Status,
    DateTime CurrentPeriodStart,
    DateTime CurrentPeriodEnd,
    bool CancelAtPeriodEnd,
    string? PlanId,
    long? PriceAmount,
    string? Currency);

/// <summary>
/// Parsed Stripe webhook event.
/// </summary>
public record StripeWebhookEvent(
    string EventId,
    string EventType,
    object Data,
    DateTime Created);
