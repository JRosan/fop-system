namespace FopSystem.Domain.Entities;

/// <summary>
/// Tracks Stripe payment intents for subscription and FOP application payments.
/// </summary>
public class PaymentIntent : Entity<Guid>, ITenantEntity
{
    /// <summary>
    /// The Stripe Payment Intent ID (e.g., "pi_xxx").
    /// </summary>
    public string StripePaymentIntentId { get; private set; } = null!;

    /// <summary>
    /// The Stripe Checkout Session ID (e.g., "cs_xxx").
    /// </summary>
    public string? StripeCheckoutSessionId { get; private set; }

    /// <summary>
    /// The Stripe Customer ID associated with this payment.
    /// </summary>
    public string? StripeCustomerId { get; private set; }

    /// <summary>
    /// The Stripe Subscription ID if this is a subscription payment.
    /// </summary>
    public string? StripeSubscriptionId { get; private set; }

    /// <summary>
    /// Payment amount in the smallest currency unit (cents for USD).
    /// </summary>
    public long Amount { get; private set; }

    /// <summary>
    /// Three-letter ISO currency code (e.g., "usd").
    /// </summary>
    public string Currency { get; private set; } = "usd";

    /// <summary>
    /// Current status of the payment intent.
    /// </summary>
    public PaymentIntentStatus Status { get; private set; }

    /// <summary>
    /// Type of payment (Subscription, Application, etc.).
    /// </summary>
    public PaymentType PaymentType { get; private set; }

    /// <summary>
    /// Description of what this payment is for.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Metadata associated with this payment (JSON).
    /// </summary>
    public string? Metadata { get; private set; }

    /// <summary>
    /// The tenant ID for multi-tenant isolation.
    /// </summary>
    public Guid TenantId { get; private set; }

    /// <summary>
    /// Reference to the subscription plan if this is a subscription payment.
    /// </summary>
    public Guid? SubscriptionPlanId { get; private set; }

    /// <summary>
    /// Reference to the FOP application if this is an application payment.
    /// </summary>
    public Guid? ApplicationId { get; private set; }

    /// <summary>
    /// When the payment was completed.
    /// </summary>
    public DateTime? CompletedAt { get; private set; }

    /// <summary>
    /// Error message if payment failed.
    /// </summary>
    public string? ErrorMessage { get; private set; }

    private PaymentIntent() { } // EF Core constructor

    private PaymentIntent(
        Guid id,
        string stripePaymentIntentId,
        long amount,
        string currency,
        PaymentType paymentType,
        Guid tenantId,
        string? description = null)
    {
        Id = id;
        StripePaymentIntentId = stripePaymentIntentId;
        Amount = amount;
        Currency = currency;
        PaymentType = paymentType;
        TenantId = tenantId;
        Description = description;
        Status = PaymentIntentStatus.Created;
    }

    /// <summary>
    /// Creates a new payment intent record.
    /// </summary>
    public static PaymentIntent Create(
        string stripePaymentIntentId,
        long amount,
        string currency,
        PaymentType paymentType,
        Guid tenantId,
        string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(stripePaymentIntentId, nameof(stripePaymentIntentId));

        return new PaymentIntent(
            Guid.NewGuid(),
            stripePaymentIntentId,
            amount,
            currency.ToLowerInvariant(),
            paymentType,
            tenantId,
            description);
    }

    /// <summary>
    /// Creates a payment intent for a subscription.
    /// </summary>
    public static PaymentIntent CreateForSubscription(
        string stripePaymentIntentId,
        string stripeCheckoutSessionId,
        long amount,
        string currency,
        Guid tenantId,
        Guid subscriptionPlanId,
        string? stripeCustomerId = null)
    {
        var intent = Create(
            stripePaymentIntentId,
            amount,
            currency,
            PaymentType.Subscription,
            tenantId,
            "Subscription payment");

        intent.StripeCheckoutSessionId = stripeCheckoutSessionId;
        intent.StripeCustomerId = stripeCustomerId;
        intent.SubscriptionPlanId = subscriptionPlanId;

        return intent;
    }

    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }

    public void SetCheckoutSession(string sessionId, string? customerId = null)
    {
        StripeCheckoutSessionId = sessionId;
        StripeCustomerId = customerId;
        SetUpdatedAt();
    }

    public void SetSubscription(string subscriptionId)
    {
        StripeSubscriptionId = subscriptionId;
        SetUpdatedAt();
    }

    public void MarkAsProcessing()
    {
        Status = PaymentIntentStatus.Processing;
        SetUpdatedAt();
    }

    public void MarkAsSucceeded()
    {
        Status = PaymentIntentStatus.Succeeded;
        CompletedAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void MarkAsFailed(string? errorMessage = null)
    {
        Status = PaymentIntentStatus.Failed;
        ErrorMessage = errorMessage;
        SetUpdatedAt();
    }

    public void MarkAsCanceled()
    {
        Status = PaymentIntentStatus.Canceled;
        SetUpdatedAt();
    }

    public void UpdateMetadata(string metadata)
    {
        Metadata = metadata;
        SetUpdatedAt();
    }
}

/// <summary>
/// Status of a Stripe payment intent.
/// </summary>
public enum PaymentIntentStatus
{
    Created,
    Processing,
    RequiresAction,
    RequiresPaymentMethod,
    Succeeded,
    Failed,
    Canceled
}

/// <summary>
/// Type of payment being processed.
/// </summary>
public enum PaymentType
{
    Subscription,
    Application,
    Renewal,
    Other
}
