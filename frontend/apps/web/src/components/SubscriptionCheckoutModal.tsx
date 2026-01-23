import { useState } from 'react';
import { X, CreditCard, Check, Lock, AlertTriangle } from 'lucide-react';
import type { SubscriptionPlan } from '@fop/api';
import { Portal } from './Portal';

interface SubscriptionCheckoutModalProps {
  plan: SubscriptionPlan;
  isAnnual: boolean;
  currentTier?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

type CheckoutStep = 'review' | 'payment' | 'processing' | 'success' | 'error';

export function SubscriptionCheckoutModal({
  plan,
  isAnnual,
  currentTier,
  onConfirm,
  onClose,
}: SubscriptionCheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isUpgrade = !currentTier || currentTier === 'Trial' ||
    (currentTier === 'Starter' && (plan.tier === 'Professional' || plan.tier === 'Enterprise')) ||
    (currentTier === 'Professional' && plan.tier === 'Enterprise');

  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const monthlyEquivalent = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return false;
    }
    if (cardExpiry.length < 5) {
      setError('Please enter a valid expiry date');
      return false;
    }
    if (cardCvc.length < 3) {
      setError('Please enter a valid CVC');
      return false;
    }
    if (cardName.trim().length < 2) {
      setError('Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setError(null);
    if (!validateCard()) return;

    setStep('processing');

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the actual subscription update
      await onConfirm();

      setStep('success');
    } catch (err) {
      setStep('error');
      setError('Payment failed. Please try again or contact support.');
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // Don't allow closing during processing
    onClose();
  };

  return (
    <Portal>
      <div className="modal-backdrop" onClick={handleClose}>
        {/* Modal */}
        <div
          className="modal-content max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-bvi-sand-200 dark:border-bvi-atlantic-700">
          <h2 className="text-xl font-semibold text-bvi-atlantic-600 dark:text-white">
            {step === 'success' ? 'Payment Successful' :
             step === 'error' ? 'Payment Failed' :
             isUpgrade ? 'Upgrade to ' + plan.name : 'Switch to ' + plan.name}
          </h2>
          {step !== 'processing' && (
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

              <button
                onClick={() => setStep('payment')}
                className="w-full py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-700 dark:text-error-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Card Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 pl-12 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-white dark:bg-bvi-atlantic-900 text-bvi-atlantic-600 dark:text-white placeholder-bvi-granite-400 focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-white dark:bg-bvi-atlantic-900 text-bvi-atlantic-600 dark:text-white placeholder-bvi-granite-400 focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-white dark:bg-bvi-atlantic-900 text-bvi-atlantic-600 dark:text-white placeholder-bvi-granite-400 focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-white dark:bg-bvi-atlantic-900 text-bvi-atlantic-600 dark:text-white placeholder-bvi-granite-400 focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-sm text-bvi-granite-500 dark:text-bvi-granite-400">
                <Lock className="w-4 h-4" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 text-bvi-granite-600 dark:text-bvi-granite-300 rounded-xl font-semibold hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors"
                >
                  Pay ${price.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-bvi-turquoise-500 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white mb-2">
                Processing Payment
              </h3>
              <p className="text-bvi-granite-500 dark:text-bvi-granite-400">
                Please wait while we process your payment...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white mb-2">
                Welcome to {plan.name}!
              </h3>
              <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
                Your subscription has been activated. You now have access to all {plan.name} features.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-error-600 dark:text-error-400" />
              </div>
              <h3 className="text-lg font-semibold text-bvi-atlantic-600 dark:text-white mb-2">
                Payment Failed
              </h3>
              <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
                {error || 'There was an issue processing your payment. Please try again.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 text-bvi-granite-600 dark:text-bvi-granite-300 rounded-xl font-semibold hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('payment')}
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
