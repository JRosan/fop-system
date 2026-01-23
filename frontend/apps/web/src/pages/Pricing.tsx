import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const permitTypes = [
  {
    name: 'One-Time Permit',
    multiplier: '1.0x',
    description: 'Single flight authorization for occasional operations',
    features: [
      'Valid for single flight',
      'Standard processing time',
      'Full compliance verification',
      'Digital permit delivery',
    ],
    highlight: false,
  },
  {
    name: 'Blanket Permit',
    multiplier: '2.5x',
    description: 'Extended authorization for regular scheduled operations',
    features: [
      'Valid for 12 months',
      'Unlimited flights within scope',
      'Priority processing',
      'Automatic renewal reminders',
      'Dedicated support',
    ],
    highlight: true,
  },
  {
    name: 'Emergency Permit',
    multiplier: '0.5x',
    description: 'Expedited processing for humanitarian and emergency operations',
    features: [
      'Rapid processing',
      'Reduced documentation',
      'Priority verification',
      '24/7 availability',
    ],
    highlight: false,
  },
];

export function Pricing() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="landing-container text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm font-medium mb-6">
            Permit Types & Fees
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Transparent, <span className="text-gradient">Standardized Pricing</span>
          </h1>
          <p className="text-lg text-bvi-sand-200 max-w-2xl mx-auto mb-8">
            Our fee structure follows the formula: <code className="px-2 py-1 rounded bg-bvi-atlantic-700 text-bvi-turquoise-400 text-sm font-mono">(Base + Seats × PerSeat + Weight × PerKg) × Multiplier</code>
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="landing-section bg-bvi-sand-50">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {permitTypes.map((permit) => (
              <div
                key={permit.name}
                className={`rounded-2xl bg-white border ${
                  permit.highlight
                    ? 'border-bvi-turquoise-500 shadow-xl shadow-bvi-turquoise-500/10 relative'
                    : 'border-bvi-sand-200'
                }`}
              >
                {permit.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-bvi-turquoise-500 text-white text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-xl font-display font-bold text-bvi-atlantic-600 mb-2">{permit.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-mono font-bold text-bvi-turquoise-500">{permit.multiplier}</span>
                    <span className="text-bvi-granite-400">multiplier</span>
                  </div>
                  <p className="text-bvi-granite-500 mb-6">{permit.description}</p>
                  <ul className="space-y-3 mb-8">
                    {permit.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-bvi-turquoise-500 flex-shrink-0 mt-0.5" />
                        <span className="text-bvi-granite-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/app/applications/new"
                    className={`block w-full py-3 text-center rounded-xl font-semibold transition-colors ${
                      permit.highlight
                        ? 'bg-bvi-turquoise-500 text-white hover:bg-bvi-turquoise-400'
                        : 'bg-bvi-atlantic-600 text-white hover:bg-bvi-atlantic-500'
                    }`}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="landing-section bg-white">
        <div className="landing-container text-center">
          <h2 className="font-display text-3xl font-bold text-bvi-atlantic-600 mb-4">Calculate Your Permit Fee</h2>
          <p className="text-lg text-bvi-granite-500 mb-8 max-w-xl mx-auto">
            Use our fee calculator to get an instant estimate based on your aircraft specifications.
          </p>
          <Link
            to="/app/fee-calculator"
            className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-bvi-atlantic-600 text-white hover:bg-bvi-atlantic-500 transition-all"
          >
            Open Fee Calculator
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
