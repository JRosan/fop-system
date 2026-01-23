import { Plane, FileText, Building, BarChart3, Calculator } from 'lucide-react';

const features = [
  {
    icon: Plane,
    title: 'Landing Fees',
    description: 'Automated calculation based on aircraft weight, type, and frequency with real-time currency conversion.',
    highlight: 'Weight-based pricing',
  },
  {
    icon: FileText,
    title: 'Permit Processing',
    description: 'End-to-end digital workflow from application submission through approval with automated compliance checks.',
    highlight: 'One-Time, Blanket, Emergency',
  },
  {
    icon: Building,
    title: 'Airport Services',
    description: 'Integrated fee management for ground handling, parking, passenger services, and facility usage.',
    highlight: 'Multi-airport support',
  },
  {
    icon: BarChart3,
    title: 'Compliance Monitoring',
    description: 'Real-time tracking of permit validity, insurance status, and regulatory requirements with automated alerts.',
    highlight: 'Proactive notifications',
  },
];

export function UnifiedRevenueEngine() {
  return (
    <section className="landing-section bg-av-cloud-50">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-av-navy-900/10 text-av-navy-900 text-sm font-medium mb-4">
            Unified Platform
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-av-navy-900 mb-4">
            Your Complete Revenue Engine
          </h2>
          <p className="text-lg text-av-cloud-600 max-w-2xl mx-auto">
            One integrated platform that captures every revenue stream while ensuring regulatory compliance across all aviation operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl p-8 border border-neutral-200 hover:border-av-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-av-cyan-500/5"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-av-navy-900 group-hover:bg-av-cyan-500 flex items-center justify-center mb-6 transition-colors">
                  <Icon className="w-7 h-7 text-av-cyan-400 group-hover:text-av-navy-900 transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-av-navy-900 mb-2">{feature.title}</h3>
                <p className="text-av-cloud-600 mb-4 leading-relaxed">{feature.description}</p>

                {/* Highlight Tag */}
                <span className="inline-block px-3 py-1 rounded-full bg-av-cyan-500/10 text-av-cyan-600 text-sm font-medium">
                  {feature.highlight}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fee Formula Callout */}
        <div className="mt-12 bg-av-navy-900 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-av-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Calculator className="w-8 h-8 text-av-cyan-400" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Transparent Fee Calculation</h3>
              <p className="text-av-cloud-300 mb-4">
                Our standardized formula ensures consistent, auditable fee computation across all permit types.
              </p>
              <code className="inline-block px-4 py-2 rounded-lg bg-av-navy-800 text-av-cyan-400 font-mono text-sm">
                Total = (Base + Seats × PerSeat + Weight × PerKg) × Multiplier
              </code>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-av-cloud-600/20 text-av-cloud-300 font-mono">1.0x</span>
                <span className="text-av-cloud-400">One-Time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-av-cyan-500/20 text-av-cyan-400 font-mono">2.5x</span>
                <span className="text-av-cloud-400">Blanket</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-av-amber-500/20 text-av-amber-400 font-mono">0.5x</span>
                <span className="text-av-cloud-400">Emergency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
