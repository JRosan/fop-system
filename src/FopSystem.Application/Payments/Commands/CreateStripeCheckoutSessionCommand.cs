using FopSystem.Application.Interfaces;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Payments.Commands;

/// <summary>
/// Command to create a Stripe Checkout session for subscription payment.
/// </summary>
public record CreateStripeCheckoutSessionCommand(
    Guid TenantId,
    Guid PlanId,
    bool IsAnnual,
    string SuccessUrl,
    string CancelUrl,
    string? CustomerEmail = null) : IRequest<CreateStripeCheckoutSessionResult>;

/// <summary>
/// Result of creating a Stripe Checkout session.
/// </summary>
public record CreateStripeCheckoutSessionResult(
    string SessionId,
    string SessionUrl,
    Guid PaymentIntentRecordId);

public class CreateStripeCheckoutSessionCommandHandler
    : IRequestHandler<CreateStripeCheckoutSessionCommand, CreateStripeCheckoutSessionResult>
{
    private readonly IStripeService _stripeService;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateStripeCheckoutSessionCommandHandler(
        IStripeService stripeService,
        ISubscriptionPlanRepository planRepository,
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _stripeService = stripeService;
        _planRepository = planRepository;
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateStripeCheckoutSessionResult> Handle(
        CreateStripeCheckoutSessionCommand request,
        CancellationToken cancellationToken)
    {
        // Get the subscription plan
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null)
        {
            throw new InvalidOperationException($"Subscription plan {request.PlanId} not found.");
        }

        // Get the tenant
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant {request.TenantId} not found.");
        }

        // Calculate price in cents
        var price = request.IsAnnual ? plan.AnnualPrice : plan.MonthlyPrice;
        var priceInCents = (long)(price.Amount * 100);
        var currencyCode = price.Currency.ToString().ToLowerInvariant();

        // Create Stripe Checkout session
        var sessionResult = await _stripeService.CreateSubscriptionCheckoutSessionAsync(
            request.TenantId,
            request.PlanId,
            priceInCents,
            currencyCode,
            request.IsAnnual,
            request.SuccessUrl,
            request.CancelUrl,
            request.CustomerEmail ?? tenant.ContactEmail,
            cancellationToken);

        // Create payment intent record for tracking
        var paymentIntent = PaymentIntent.Create(
            sessionResult.PaymentIntentId ?? $"checkout_{sessionResult.SessionId}",
            priceInCents,
            currencyCode,
            PaymentType.Subscription,
            request.TenantId,
            $"Subscription to {plan.Name} ({(request.IsAnnual ? "Annual" : "Monthly")})");

        paymentIntent.SetCheckoutSession(sessionResult.SessionId, sessionResult.CustomerId);
        paymentIntent.UpdateMetadata(System.Text.Json.JsonSerializer.Serialize(new
        {
            PlanId = request.PlanId,
            PlanName = plan.Name,
            PlanTier = plan.Tier.ToString(),
            IsAnnual = request.IsAnnual,
            TenantId = request.TenantId,
            TenantName = tenant.Name
        }));

        // Save the payment intent record
        // Note: We need to add this to the DbContext
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateStripeCheckoutSessionResult(
            sessionResult.SessionId,
            sessionResult.SessionUrl,
            paymentIntent.Id);
    }
}
