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
      <section className="bg-av-navy-900 py-20 md:py-28">
        <div className="landing-container text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-av-cyan-500/10 border border-av-cyan-500/20 text-av-cyan-400 text-sm font-medium mb-6">
            Permit Types & Fees
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Transparent, <span className="text-gradient">Standardized Pricing</span>
          </h1>
          <p className="text-lg text-av-cloud-300 max-w-2xl mx-auto mb-8">
            Our fee structure follows the formula: <code className="px-2 py-1 rounded bg-av-navy-800 text-av-cyan-400 text-sm">(Base + Seats × PerSeat + Weight × PerKg) × Multiplier</code>
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="landing-section bg-white">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {permitTypes.map((permit) => (
              <div
                key={permit.name}
                className={`rounded-2xl border ${
                  permit.highlight
                    ? 'border-av-cyan-500 shadow-xl shadow-av-cyan-500/10 relative'
                    : 'border-neutral-200'
                }`}
              >
                {permit.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-av-cyan-500 text-av-navy-900 text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-av-navy-900 mb-2">{permit.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-av-cyan-600">{permit.multiplier}</span>
                    <span className="text-av-cloud-500">multiplier</span>
                  </div>
                  <p className="text-av-cloud-600 mb-6">{permit.description}</p>
                  <ul className="space-y-3 mb-8">
                    {permit.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-av-cyan-500 flex-shrink-0 mt-0.5" />
                        <span className="text-av-cloud-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/app/applications/new"
                    className={`block w-full py-3 text-center rounded-xl font-semibold transition-colors ${
                      permit.highlight
                        ? 'bg-av-cyan-500 text-av-navy-900 hover:bg-av-cyan-400'
                        : 'bg-av-navy-900 text-white hover:bg-av-navy-800'
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
      <section className="landing-section bg-av-cloud-50">
        <div className="landing-container text-center">
          <h2 className="text-3xl font-bold text-av-navy-900 mb-4">Calculate Your Permit Fee</h2>
          <p className="text-lg text-av-cloud-600 mb-8 max-w-xl mx-auto">
            Use our fee calculator to get an instant estimate based on your aircraft specifications.
          </p>
          <Link
            to="/app/fee-calculator"
            className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-av-navy-900 text-white hover:bg-av-navy-800 transition-all"
          >
            Open Fee Calculator
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
