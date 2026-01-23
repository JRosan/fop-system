import { useState } from 'react';
import { X, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import type { SubscriptionPlan } from '@fop/api';
import { stripeApi } from '@fop/api';
import { Portal } from './Portal';

interface SubscriptionCheckoutModalProps {
  plan: SubscriptionPlan;
  isAnnual: boolean;
  currentTier?: string;
  tenantId: string;
  customerEmail?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

type CheckoutStep = 'review' | 'redirecting' | 'error';

export function SubscriptionCheckoutModal({
  plan,
  isAnnual,
  currentTier,
  tenantId,
  customerEmail,
  onClose,
}: SubscriptionCheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [error, setError] = useState<string | null>(null);

  const isUpgrade = !currentTier || currentTier === 'Trial' ||
    (currentTier === 'Starter' && (plan.tier === 'Professional' || plan.tier === 'Enterprise')) ||
    (currentTier === 'Professional' && plan.tier === 'Enterprise');

  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const monthlyEquivalent = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

  const handleCheckout = async () => {
    setError(null);
    setStep('redirecting');

    try {
      // Redirect to Stripe Checkout
      await stripeApi.redirectToCheckout(
        tenantId,
        plan.id,
        isAnnual,
        customerEmail
      );
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'Failed to start checkout. Please try again.');
    }
  };

  const handleClose = () => {
    if (step === 'redirecting') return;
    onClose();
  };

  return (
    <Portal>
      <div className="modal-backdrop" onClick={handleClose}>
        <div
          className="modal-content max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-bvi-sand-200 dark:border-bvi-atlantic-700">
            <h2 className="text-xl font-semibold text-bvi-atlantic-600 dark:text-white">
              {step === 'error' ? 'Checkout Failed' :
               isUpgrade ? 'Upgrade to ' + plan.name : 'Switch to ' + plan.name}
            </h2>
            {step !== 'redirecting' && (
              <button
                onClick={handleClose}
                className="p-2 text-bvi-granite-400 hover:text-bvi-granite-600 dark:hover:text-white rounded-lg hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'review' && (
              <div className="space-y-6">
                {/* Plan Summary */}
                <div className="bg-bvi-sand-50 dark:bg-bvi-atlantic-900 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white">{plan.name} Plan</h3>
                      <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white">
                        ${monthlyEquivalent.toLocaleString()}
                      </p>
                      <p className="text-sm text-bvi-granite-400">/month</p>
                    </div>
                  </div>
                </div>

                {/* Billing Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-bvi-granite-500 dark:text-bvi-granite-400">
                      {plan.name} Plan ({isAnnual ? 'Annual' : 'Monthly'})
                    </span>
                    <span className="text-bvi-atlantic-600 dark:text-white">
                      ${price.toLocaleString()}
                    </span>
                  </div>
                  {isAnnual && (
                    <div className="flex justify-between text-sm">
                      <span className="text-bvi-turquoise-600">Annual discount (17%)</span>
                      <span className="text-bvi-turquoise-600">
                        -${(plan.monthlyPrice * 12 - plan.annualPrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-bvi-sand-200 dark:border-bvi-atlantic-700 flex justify-between">
                    <span className="font-semibold text-bvi-atlantic-600 dark:text-white">Total due today</span>
                    <span className="font-bold text-xl text-bvi-atlantic-600 dark:text-white">
                      ${price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Features included */}
                <div>
                  <p className="text-sm font-medium text-bvi-granite-500 dark:text-bvi-granite-400 mb-2">Includes:</p>
                  <ul className="grid grid-cols-2 gap-2 text-sm">
                    <li className="flex items-center gap-2 text-bvi-granite-600 dark:text-bvi-granite-300">
                      <Check className="w-4 h-4 text-bvi-turquoise-500" />
                      {plan.maxUsers ? `${plan.maxUsers} users` : 'Unlimited users'}
                    </li>
                    <li className="flex items-center gap-2 text-bvi-granite-600 dark:text-bvi-granite-300">
                      <Check className="w-4 h-4 text-bvi-turquoise-500" />
                      {plan.maxApplicationsPerMonth ? `${plan.maxApplicationsPerMonth} apps/mo` : 'Unlimited apps'}
                    </li>
                    {plan.includesCustomBranding && (
                      <li className="flex items-center gap-2 text-bvi-granite-600 dark:text-bvi-granite-300">
                        <Check className="w-4 h-4 text-bvi-turquoise-500" />
                        Custom branding
                      </li>
                    )}
                    {plan.includesApiAccess && (
                      <li className="flex items-center gap-2 text-bvi-granite-600 dark:text-bvi-granite-300">
                        <Check className="w-4 h-4 text-bvi-turquoise-500" />
                        API access
                      </li>
                    )}
                  </ul>
                </div>

                {/* Secure checkout notice */}
                <div className="flex items-center gap-2 p-3 bg-bvi-turquoise-50 dark:bg-bvi-turquoise-900/20 border border-bvi-turquoise-200 dark:border-bvi-turquoise-800 rounded-lg text-sm text-bvi-turquoise-700 dark:text-bvi-turquoise-400">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span>You'll be redirected to Stripe for secure payment processing.</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Checkout
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 'redirecting' && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-bvi-turquoise-500 border-t-transparent rounded-full animate-spin" />
                <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white mb-2">
                  Redirecting to Stripe
                </h3>
                <p className="text-bvi-granite-500 dark:text-bvi-granite-400">
                  Please wait while we redirect you to secure checkout...
                </p>
              </div>
            )}

            {step === 'error' && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-error-600 dark:text-error-400" />
                </div>
                <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white mb-2">
                  Checkout Failed
                </h3>
                <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
                  {error || 'There was an issue starting the checkout process. Please try again.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 text-bvi-granite-600 dark:text-bvi-granite-300 rounded-xl font-semibold hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="px-6 py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
