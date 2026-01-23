import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, X, CreditCard, Calendar, Clock, AlertTriangle, ArrowRight, Receipt, Download, XCircle } from 'lucide-react';
import { subscriptionApi, type SubscriptionPlan, type TenantSubscription } from '@fop/api';
import { useNotificationStore, useTenantStore } from '@fop/core';
import { SubscriptionCheckoutModal } from '../components/SubscriptionCheckoutModal';
import { CancelSubscriptionModal } from '../components/CancelSubscriptionModal';

const featureLabels: Record<string, string> = {
  maxUsers: 'Team Members',
  maxApplicationsPerMonth: 'Applications/Month',
  includesCustomBranding: 'Custom Branding',
  includesApiAccess: 'API Access',
  includesPrioritySupport: 'Priority Support',
  includesDedicatedManager: 'Dedicated Account Manager',
  includesAdvancedAnalytics: 'Advanced Analytics',
  includesSlaGuarantee: '99.9% SLA Guarantee',
};

// Mock billing history for demonstration
const mockBillingHistory = [
  { id: '1', date: '2024-12-01', description: 'Professional Plan - Monthly', amount: 1499, status: 'paid' as const },
  { id: '2', date: '2024-11-01', description: 'Professional Plan - Monthly', amount: 1499, status: 'paid' as const },
  { id: '3', date: '2024-10-01', description: 'Professional Plan - Monthly', amount: 1499, status: 'paid' as const },
];

export function Subscription() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { addNotification } = useNotificationStore();
  const { tenant } = useTenantStore();
  const tenantId = tenant?.id;

  // Check URL params for pre-selected plan (from Pricing page) or Stripe redirect
  useEffect(() => {
    const planParam = searchParams.get('plan');
    const billingParam = searchParams.get('billing');
    const successParam = searchParams.get('success');
    const canceledParam = searchParams.get('canceled');

    if (billingParam) {
      setIsAnnual(billingParam === 'annual');
    }

    // Handle Stripe redirect responses
    if (successParam === 'true') {
      addNotification({
        type: 'success',
        title: 'Payment Successful',
        message: 'Your subscription has been activated. Welcome aboard!',
      });
      // Clear the URL params
      setSearchParams({});
      // Reload data to get updated subscription
      loadData();
    }

    if (canceledParam === 'true') {
      addNotification({
        type: 'info',
        title: 'Checkout Canceled',
        message: 'Your checkout was canceled. No payment was processed.',
      });
      // Clear the URL params
      setSearchParams({});
    }

    // We'll handle the plan selection after data loads
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [tenantId]);

  async function loadData() {
    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionApi.getPlans(),
        tenantId ? subscriptionApi.getTenantSubscription(tenantId).catch(() => null) : Promise.resolve(null),
      ]);
      const filteredPlans = plansData.filter(p => p.tier !== 'Trial');
      setPlans(filteredPlans);
      setSubscription(subscriptionData);
      if (subscriptionData) {
        setIsAnnual(subscriptionData.isAnnualBilling);
      }

      // Check if a plan was pre-selected via URL params (from Pricing page)
      const planParam = searchParams.get('plan');
      if (planParam) {
        const preSelectedPlan = filteredPlans.find(
          p => p.name.toLowerCase() === planParam.toLowerCase() || p.tier.toLowerCase() === planParam.toLowerCase()
        );
        if (preSelectedPlan && preSelectedPlan.tier !== 'Enterprise') {
          // Auto-open checkout modal for the selected plan
          setSelectedPlan(preSelectedPlan);
          setShowCheckoutModal(true);
          // Clear the URL params
          setSearchParams({});
        }
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load subscription data',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSelectPlan(plan: SubscriptionPlan) {
    // For Enterprise, contact sales
    if (plan.tier === 'Enterprise') {
      window.location.href = '/contact';
      return;
    }
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  }

  async function handleCheckoutConfirm() {
    if (!selectedPlan || !tenantId) return;

    const updated = await subscriptionApi.updateSubscription(tenantId, {
      tier: selectedPlan.tier,
      isAnnualBilling: isAnnual,
    });
    setSubscription(updated);
    addNotification({
      type: 'success',
      title: 'Subscription Updated',
      message: `Successfully upgraded to ${selectedPlan.name} plan`,
    });
  }

  async function handleCancelSubscription() {
    // In a real implementation, this would call an API to cancel the subscription
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update local state to reflect cancellation (subscription remains active until end of period)
    if (subscription) {
      setSubscription({
        ...subscription,
        // The subscription will remain active until the end date
      });
    }

    addNotification({
      type: 'info',
      title: 'Subscription Cancelled',
      message: 'Your subscription will remain active until the end of your billing period.',
    });
  }

  async function handleStartTrial() {
    if (!tenantId) return;
    try {
      setUpgrading('trial');
      const updated = await subscriptionApi.startTrial(tenantId);
      setSubscription(updated);
      addNotification({
        type: 'success',
        title: 'Trial Started',
        message: 'Your 30-day trial has started. Enjoy full Professional features!',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to start trial. You may have already used your trial period.',
      });
    } finally {
      setUpgrading(null);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getDaysRemaining(endDate: string | null): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bvi-turquoise-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-bvi-atlantic-600 dark:text-white">
          Subscription Management
        </h1>
        <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mt-1">
          Manage your FOP System subscription and billing
        </p>
      </div>

      {/* Current Subscription Card */}
      {subscription && (
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Current Subscription
              </h2>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-bvi-granite-500 dark:text-bvi-granite-400">Plan:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.subscriptionTier === 'Enterprise'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : subscription.subscriptionTier === 'Professional'
                      ? 'bg-bvi-turquoise-100 text-bvi-turquoise-700 dark:bg-bvi-turquoise-900/30 dark:text-bvi-turquoise-400'
                      : subscription.subscriptionTier === 'Starter'
                      ? 'bg-bvi-atlantic-100 text-bvi-atlantic-700 dark:bg-bvi-atlantic-900/30 dark:text-bvi-atlantic-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {subscription.subscriptionTier}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-bvi-granite-500 dark:text-bvi-granite-400">Billing:</span>
                  <span className="text-bvi-atlantic-600 dark:text-white">
                    {subscription.isAnnualBilling ? 'Annual' : 'Monthly'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-bvi-granite-500 dark:text-bvi-granite-400">Status:</span>
                  <span className={`flex items-center gap-1 ${subscription.isActive ? 'text-success-600' : 'text-error-600'}`}>
                    {subscription.isActive ? (
                      <>
                        <Check className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              {subscription.subscriptionTier === 'Trial' && subscription.trialEndDate && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Trial Period</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                    {getDaysRemaining(subscription.trialEndDate)} days left
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-500">
                    Ends {formatDate(subscription.trialEndDate)}
                  </p>
                </div>
              )}
              {subscription.subscriptionTier !== 'Trial' && subscription.subscriptionEndDate && (
                <div>
                  <div className="flex items-center gap-2 text-bvi-granite-500 dark:text-bvi-granite-400">
                    <Calendar className="w-4 h-4" />
                    <span>Next billing date</span>
                  </div>
                  <p className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white mt-1">
                    {formatDate(subscription.subscriptionEndDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {subscription.subscriptionTier === 'Trial' && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">Upgrade before your trial ends</p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                  To continue using the FOP System without interruption, please select a plan below.
                </p>
              </div>
            </div>
          )}

          {/* Cancel subscription link for paid plans */}
          {subscription.subscriptionTier !== 'Trial' && (
            <div className="mt-4 pt-4 border-t border-bvi-sand-200 dark:border-bvi-atlantic-700 flex justify-between items-center">
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-sm text-error-500 hover:text-error-600 dark:hover:text-error-400 flex items-center gap-1 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </button>
              <p className="text-xs text-bvi-granite-400">
                Cancellation takes effect at end of billing period
              </p>
            </div>
          )}
        </div>
      )}

      {/* Start Trial CTA (if no subscription) */}
      {!subscription && (
        <div className="bg-gradient-to-r from-bvi-turquoise-500 to-bvi-atlantic-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Start Your Free Trial</h2>
          <p className="text-bvi-sand-200 mb-4">
            Get 30 days of full Professional features. No credit card required.
          </p>
          <button
            onClick={handleStartTrial}
            disabled={upgrading === 'trial'}
            className="px-6 py-3 bg-white text-bvi-atlantic-600 rounded-lg font-semibold hover:bg-bvi-sand-100 transition-colors disabled:opacity-50"
          >
            {upgrading === 'trial' ? 'Starting Trial...' : 'Start Free Trial'}
          </button>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 bg-bvi-sand-100 dark:bg-bvi-atlantic-700 rounded-full p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              !isAnnual
                ? 'bg-white dark:bg-bvi-atlantic-600 text-bvi-atlantic-600 dark:text-white shadow-sm'
                : 'text-bvi-granite-500 dark:text-bvi-granite-400 hover:text-bvi-atlantic-600 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              isAnnual
                ? 'bg-white dark:bg-bvi-atlantic-600 text-bvi-atlantic-600 dark:text-white shadow-sm'
                : 'text-bvi-granite-500 dark:text-bvi-granite-400 hover:text-bvi-atlantic-600 dark:hover:text-white'
            }`}
          >
            Annual
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isAnnual
                ? 'bg-bvi-turquoise-500 text-white'
                : 'bg-bvi-turquoise-500/20 text-bvi-turquoise-600 dark:text-bvi-turquoise-400'
            }`}>
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.subscriptionTier === plan.tier;
          const isHighlighted = plan.tier === 'Professional';

          return (
            <div
              key={plan.id}
              className={`rounded-xl border ${
                isHighlighted
                  ? 'border-bvi-turquoise-500 shadow-lg shadow-bvi-turquoise-500/10 relative'
                  : 'border-bvi-sand-200 dark:border-bvi-atlantic-700'
              } bg-white dark:bg-bvi-atlantic-800`}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-bvi-turquoise-500 text-white text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 rounded-full bg-success-500 text-white text-xs font-semibold">
                    Current Plan
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400 mt-1 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-4">
                  {plan.monthlyPrice > 0 ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-bvi-atlantic-600 dark:text-white">
                          ${isAnnual ? Math.round(plan.annualPrice / 12).toLocaleString() : plan.monthlyPrice.toLocaleString()}
                        </span>
                        <span className="text-bvi-granite-400">/month</span>
                      </div>
                      {isAnnual && (
                        <p className="text-sm text-bvi-granite-400 mt-1">
                          ${plan.annualPrice.toLocaleString()} billed annually
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-bvi-atlantic-600 dark:text-white">
                        Custom
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-bvi-turquoise-500" />
                    <span className="text-bvi-granite-600 dark:text-bvi-granite-300">
                      {plan.maxUsers ? `${plan.maxUsers} ${featureLabels.maxUsers}` : `Unlimited ${featureLabels.maxUsers}`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-bvi-turquoise-500" />
                    <span className="text-bvi-granite-600 dark:text-bvi-granite-300">
                      {plan.maxApplicationsPerMonth ? `${plan.maxApplicationsPerMonth} ${featureLabels.maxApplicationsPerMonth}` : `Unlimited ${featureLabels.maxApplicationsPerMonth}`}
                    </span>
                  </li>
                  {Object.entries({
                    includesCustomBranding: plan.includesCustomBranding,
                    includesApiAccess: plan.includesApiAccess,
                    includesPrioritySupport: plan.includesPrioritySupport,
                    includesDedicatedManager: plan.includesDedicatedManager,
                    includesAdvancedAnalytics: plan.includesAdvancedAnalytics,
                    includesSlaGuarantee: plan.includesSlaGuarantee,
                  }).map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2 text-sm">
                      {value ? (
                        <Check className="w-4 h-4 text-bvi-turquoise-500" />
                      ) : (
                        <X className="w-4 h-4 text-bvi-granite-300" />
                      )}
                      <span className={value ? 'text-bvi-granite-600 dark:text-bvi-granite-300' : 'text-bvi-granite-400'}>
                        {featureLabels[key]}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`mt-6 w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-bvi-granite-100 dark:bg-bvi-granite-700 text-bvi-granite-400 cursor-not-allowed'
                      : isHighlighted
                      ? 'bg-bvi-turquoise-500 text-white hover:bg-bvi-turquoise-400 disabled:opacity-50'
                      : 'bg-bvi-atlantic-600 text-white hover:bg-bvi-atlantic-500 disabled:opacity-50'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.monthlyPrice > 0 ? (
                    <>
                      {subscription?.subscriptionTier === 'Trial' ? 'Upgrade Now' : 'Switch Plan'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Contact Sales'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Billing History */}
      {subscription && subscription.subscriptionTier !== 'Trial' && (
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 overflow-hidden">
          <div className="p-6 border-b border-bvi-sand-200 dark:border-bvi-atlantic-700">
            <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Billing History
            </h3>
          </div>
          <div className="divide-y divide-bvi-sand-200 dark:divide-bvi-atlantic-700">
            {mockBillingHistory.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-bvi-sand-100 dark:bg-bvi-atlantic-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-bvi-granite-500 dark:text-bvi-granite-400" />
                  </div>
                  <div>
                    <p className="font-medium text-bvi-atlantic-600 dark:text-white">{invoice.description}</p>
                    <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">
                      {new Date(invoice.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-bvi-atlantic-600 dark:text-white">
                      ${invoice.amount.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                        : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                    }`}>
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <button className="p-2 text-bvi-granite-400 hover:text-bvi-granite-600 dark:hover:text-white rounded-lg hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {mockBillingHistory.length === 0 && (
            <div className="p-8 text-center">
              <Receipt className="w-12 h-12 mx-auto text-bvi-granite-300 dark:text-bvi-granite-600" />
              <p className="mt-2 text-bvi-granite-500 dark:text-bvi-granite-400">No billing history yet</p>
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      <div className="bg-bvi-sand-50 dark:bg-bvi-atlantic-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-bvi-atlantic-600 dark:text-white">
              Can I upgrade or downgrade anytime?
            </h4>
            <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400 mt-1">
              Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-bvi-atlantic-600 dark:text-white">
              What happens when my trial ends?
            </h4>
            <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400 mt-1">
              You'll need to select a paid plan to continue using the service. Your data will be preserved for 30 days after the trial ends.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-bvi-atlantic-600 dark:text-white">
              Is there a refund policy?
            </h4>
            <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400 mt-1">
              We offer a 14-day money-back guarantee for all new subscriptions. Contact support if you're not satisfied.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPlan && (
        <SubscriptionCheckoutModal
          plan={selectedPlan}
          isAnnual={isAnnual}
          currentTier={subscription?.subscriptionTier}
          tenantId={subscription?.tenantId || tenantId || ''}
          customerEmail={undefined}
          onConfirm={handleCheckoutConfirm}
          onClose={() => {
            setShowCheckoutModal(false);
            setSelectedPlan(null);
            loadData(); // Refresh data after modal closes
          }}
        />
      )}

      {/* Cancel Modal */}
      {showCancelModal && subscription && (
        <CancelSubscriptionModal
          planName={subscription.subscriptionTier}
          endDate={subscription.subscriptionEndDate}
          onConfirm={handleCancelSubscription}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
