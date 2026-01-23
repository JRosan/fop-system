import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, Building2, Plane, HelpCircle } from 'lucide-react';

const subscriptionPlans = [
  {
    name: 'Starter',
    description: 'For small territories getting started with digital permit management',
    monthlyPrice: 499,
    annualPrice: 4990,
    features: {
      users: '5 users',
      applications: '50/month',
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      dedicatedManager: false,
      advancedAnalytics: false,
      slaGuarantee: false,
    },
    highlight: false,
  },
  {
    name: 'Professional',
    description: 'For growing territories with advanced compliance needs',
    monthlyPrice: 1499,
    annualPrice: 14990,
    features: {
      users: '25 users',
      applications: '500/month',
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      dedicatedManager: false,
      advancedAnalytics: true,
      slaGuarantee: false,
    },
    highlight: true,
  },
  {
    name: 'Enterprise',
    description: 'For large territories requiring full platform capabilities',
    monthlyPrice: null,
    annualPrice: null,
    features: {
      users: 'Unlimited',
      applications: 'Unlimited',
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      dedicatedManager: true,
      advancedAnalytics: true,
      slaGuarantee: true,
    },
    highlight: false,
  },
];

const featureLabels: Record<string, string> = {
  users: 'Team Members',
  applications: 'Applications',
  customBranding: 'Custom Branding',
  apiAccess: 'API Access',
  prioritySupport: 'Priority Support',
  dedicatedManager: 'Dedicated Account Manager',
  advancedAnalytics: 'Advanced Analytics',
  slaGuarantee: '99.9% SLA Guarantee',
};

const permitTypes = [
  {
    name: 'One-Time Permit',
    multiplier: '1.0x',
    description: 'Single flight authorization',
  },
  {
    name: 'Blanket Permit',
    multiplier: '2.5x',
    description: '12-month unlimited flights',
  },
  {
    name: 'Emergency Permit',
    multiplier: '0.5x',
    description: 'Humanitarian operations',
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    // Navigate to subscription page with plan pre-selected
    const billing = isAnnual ? 'annual' : 'monthly';
    navigate(`/app/subscription?plan=${planName}&billing=${billing}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-bvi-atlantic-600 to-bvi-atlantic-700 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="landing-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            SaaS Platform Pricing
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Simple, Transparent <span className="text-bvi-turquoise-400">Pricing</span>
          </h1>
          <p className="text-lg text-bvi-sand-200 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your territory's needs. All plans include secure hosting, automatic updates, and compliance monitoring.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center justify-center gap-3 bg-bvi-atlantic-500/50 backdrop-blur-sm rounded-full p-1.5">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                !isAnnual
                  ? 'bg-white text-bvi-atlantic-600 shadow-md'
                  : 'text-bvi-sand-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isAnnual
                  ? 'bg-white text-bvi-atlantic-600 shadow-md'
                  : 'text-bvi-sand-300 hover:text-white'
              }`}
            >
              Annual
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isAnnual
                  ? 'bg-bvi-turquoise-500 text-white'
                  : 'bg-bvi-turquoise-500/20 text-bvi-turquoise-400'
              }`}>
                -17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 md:py-24 bg-bvi-sand-50">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl bg-white border ${
                  plan.highlight
                    ? 'border-bvi-turquoise-500 shadow-xl shadow-bvi-turquoise-500/10 relative'
                    : 'border-bvi-sand-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-bvi-turquoise-500 text-white text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-xl font-display font-bold text-bvi-atlantic-600 mb-2">{plan.name}</h3>
                  <p className="text-bvi-granite-500 mb-6 min-h-[48px]">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthlyPrice ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-bvi-atlantic-600">
                            ${isAnnual ? Math.round(plan.annualPrice! / 12).toLocaleString() : plan.monthlyPrice.toLocaleString()}
                          </span>
                          <span className="text-bvi-granite-400">/month</span>
                        </div>
                        {isAnnual && (
                          <p className="text-sm text-bvi-granite-400 mt-1">
                            ${plan.annualPrice!.toLocaleString()} billed annually
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-bvi-atlantic-600">Custom</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <li key={key} className="flex items-center gap-3">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="w-5 h-5 text-bvi-turquoise-500 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-bvi-granite-300 flex-shrink-0" />
                          )
                        ) : (
                          <Check className="w-5 h-5 text-bvi-turquoise-500 flex-shrink-0" />
                        )}
                        <span className={typeof value === 'boolean' && !value ? 'text-bvi-granite-400' : 'text-bvi-granite-600'}>
                          {typeof value === 'boolean' ? featureLabels[key] : `${value} ${featureLabels[key]}`}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.monthlyPrice ? (
                    <button
                      onClick={() => handleSelectPlan(plan.name)}
                      className={`block w-full py-3 text-center rounded-xl font-semibold transition-colors ${
                        plan.highlight
                          ? 'bg-bvi-turquoise-500 text-white hover:bg-bvi-turquoise-400'
                          : 'bg-bvi-atlantic-600 text-white hover:bg-bvi-atlantic-500'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 inline-block ml-2" />
                    </button>
                  ) : (
                    <Link
                      to="/contact"
                      className="block w-full py-3 text-center rounded-xl font-semibold border-2 border-bvi-atlantic-600 text-bvi-atlantic-600 hover:bg-bvi-atlantic-50 transition-colors"
                    >
                      Contact Sales
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Permit Fees Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="landing-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bvi-atlantic-100 text-bvi-atlantic-600 text-sm font-medium mb-4">
              <Plane className="w-4 h-4" />
              For Aircraft Operators
            </div>
            <h2 className="font-display text-3xl font-bold text-bvi-atlantic-600 mb-4">Permit Fee Structure</h2>
            <p className="text-lg text-bvi-granite-500 max-w-2xl mx-auto">
              Permit fees are calculated using a transparent formula based on aircraft specifications
            </p>
          </div>

          {/* Formula */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-bvi-sand-50 rounded-2xl p-6 text-center">
              <p className="text-sm text-bvi-granite-500 mb-2">Fee Formula</p>
              <code className="text-lg font-mono font-semibold text-bvi-atlantic-600">
                (Base + Seats × PerSeat + Weight × PerKg) × Multiplier
              </code>
            </div>
          </div>

          {/* Permit Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {permitTypes.map((permit) => (
              <div key={permit.name} className="bg-bvi-sand-50 rounded-xl p-6 text-center">
                <h3 className="font-semibold text-bvi-atlantic-600 mb-1">{permit.name}</h3>
                <p className="text-3xl font-mono font-bold text-bvi-turquoise-500 mb-2">{permit.multiplier}</p>
                <p className="text-sm text-bvi-granite-500">{permit.description}</p>
              </div>
            ))}
          </div>

          {/* Calculator CTA */}
          <div className="text-center mt-12">
            <Link
              to="/app/fee-calculator"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-bvi-atlantic-600 text-white hover:bg-bvi-atlantic-500 transition-all"
            >
              Calculate Your Permit Fee
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-bvi-sand-50">
        <div className="landing-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="w-12 h-12 text-bvi-atlantic-600 mx-auto mb-4" />
              <h2 className="font-display text-3xl font-bold text-bvi-atlantic-600 mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-bvi-atlantic-600 mb-2">What's included in all plans?</h3>
                <p className="text-bvi-granite-600">
                  All plans include secure cloud hosting, automatic software updates, data backup, email support, and basic compliance monitoring.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-bvi-atlantic-600 mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-bvi-granite-600">
                  Yes, you can change your plan at any time. When upgrading, you'll be charged a prorated amount. When downgrading, the change takes effect at the next billing cycle.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-bvi-atlantic-600 mb-2">Is there a free trial?</h3>
                <p className="text-bvi-granite-600">
                  Yes, all new territories receive a 30-day free trial with full Professional tier features. No credit card required to start.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-bvi-atlantic-600 mb-2">Who pays the permit fees?</h3>
                <p className="text-bvi-granite-600">
                  Permit fees are paid by aircraft operators directly to your territory's aviation authority. The subscription fee is separate from permit revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-bvi-atlantic-600">
        <div className="landing-container text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Modernize Your Aviation Authority?</h2>
          <p className="text-lg text-bvi-sand-200 mb-8 max-w-xl mx-auto">
            Join Caribbean aviation authorities already using the FOP System to streamline permit management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-bvi-turquoise-500 text-white font-semibold hover:bg-bvi-turquoise-400 transition-colors"
            >
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              View All Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
