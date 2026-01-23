import { Plane, FileText, Building, BarChart3, Calculator } from 'lucide-react';
import { AnimatedSection } from '../AnimatedSection';

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
    <section className="landing-section bg-bvi-sand-50">
      <div className="landing-container">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bvi-atlantic-600/10 text-bvi-atlantic-600 text-sm font-medium mb-4">
            Unified Platform
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bvi-atlantic-600 mb-4">
            Your Complete Revenue Engine
          </h2>
          <p className="text-lg text-bvi-granite-500 max-w-2xl mx-auto">
            One integrated platform that captures every revenue stream while ensuring regulatory compliance across all aviation operations.
          </p>
        </AnimatedSection>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedSection
                key={feature.title}
                delay={index * 100}
                direction={index % 2 === 0 ? 'left' : 'right'}
              >
                <div className="group relative bg-white rounded-2xl p-8 border border-bvi-sand-200 hover:border-bvi-turquoise-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-bvi-turquoise-500/5 h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-bvi-atlantic-600 group-hover:bg-bvi-turquoise-500 flex items-center justify-center mb-6 transition-colors">
                    <Icon className="w-7 h-7 text-bvi-turquoise-400 group-hover:text-white transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-display font-bold text-bvi-atlantic-600 mb-2">{feature.title}</h3>
                  <p className="text-bvi-granite-500 mb-4 leading-relaxed">{feature.description}</p>

                  {/* Highlight Tag */}
                  <span className="inline-block px-3 py-1 rounded-full bg-bvi-turquoise-500/10 text-bvi-turquoise-600 text-sm font-medium">
                    {feature.highlight}
                  </span>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Fee Formula Callout */}
        <AnimatedSection delay={200} className="mt-12">
          <div className="bg-bvi-atlantic-600 rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-bvi-turquoise-500/20 flex items-center justify-center flex-shrink-0">
                <Calculator className="w-8 h-8 text-bvi-turquoise-400" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-display font-bold text-white mb-2">Transparent Fee Calculation</h3>
                <p className="text-bvi-sand-200 mb-4">
                  Our standardized formula ensures consistent, auditable fee computation across all permit types.
                </p>
                <code className="inline-block px-4 py-2 rounded-lg bg-bvi-atlantic-700 text-bvi-turquoise-400 font-mono text-sm">
                  Total = (Base + Seats × PerSeat + Weight × PerKg) × Multiplier
                </code>
              </div>
              <div className="flex flex-col gap-3 text-sm font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-bvi-sand-200/20 text-bvi-sand-200">1.0x</span>
                  <span className="text-bvi-sand-300">One-Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-bvi-turquoise-500/20 text-bvi-turquoise-400">2.5x</span>
                  <span className="text-bvi-sand-300">Blanket</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-bvi-gold-500/20 text-bvi-gold-400">0.5x</span>
                  <span className="text-bvi-sand-300">Emergency</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
