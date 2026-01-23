import { Link } from 'react-router-dom';
import { ClipboardCheck, PieChart, Plane, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '../AnimatedSection';

const audiences = [
  {
    icon: ClipboardCheck,
    title: 'Civil Aviation Officers',
    color: 'atlantic',
    benefits: [
      'Streamlined permit review workflows',
      'Automated compliance validation',
      'Complete audit trail for decisions',
      'Real-time status dashboards',
    ],
    cta: 'View Reviewer Dashboard',
    href: '/app/review',
  },
  {
    icon: PieChart,
    title: 'Finance & Revenue',
    color: 'turquoise',
    benefits: [
      'Automated fee calculations',
      'Payment tracking & reconciliation',
      'Revenue analytics & forecasting',
      'Multi-currency support',
    ],
    cta: 'Explore Finance Tools',
    href: '/app/finance',
  },
  {
    icon: Plane,
    title: 'Aircraft Operators',
    color: 'gold',
    benefits: [
      'Simple online application portal',
      'Document upload & management',
      'Real-time application tracking',
      'Permit verification & downloads',
    ],
    cta: 'Start Application',
    href: '/app/applications/new',
  },
];

const colorClasses = {
  atlantic: {
    bg: 'bg-bvi-atlantic-600',
    bgLight: 'bg-bvi-atlantic-50',
    text: 'text-bvi-atlantic-600',
    bullet: 'bg-bvi-atlantic-500',
    hover: 'hover:bg-bvi-atlantic-700',
  },
  turquoise: {
    bg: 'bg-bvi-turquoise-500',
    bgLight: 'bg-bvi-turquoise-50',
    text: 'text-bvi-turquoise-600',
    bullet: 'bg-bvi-turquoise-500',
    hover: 'hover:bg-bvi-turquoise-600',
  },
  gold: {
    bg: 'bg-bvi-gold-500',
    bgLight: 'bg-bvi-gold-50',
    text: 'text-bvi-gold-600',
    bullet: 'bg-bvi-gold-500',
    hover: 'hover:bg-bvi-gold-600',
  },
};

export function AudienceSection() {
  return (
    <section className="landing-section bg-white">
      <div className="landing-container">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bvi-atlantic-600/10 text-bvi-atlantic-600 text-sm font-medium mb-4">
            Built for Everyone
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bvi-atlantic-600 mb-4">
            Designed for Your Role
          </h2>
          <p className="text-lg text-bvi-granite-500 max-w-2xl mx-auto">
            Purpose-built interfaces and workflows tailored to the unique needs of each stakeholder in the aviation ecosystem.
          </p>
        </AnimatedSection>

        {/* Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            const colors = colorClasses[audience.color as keyof typeof colorClasses];
            return (
              <AnimatedSection key={audience.title} delay={index * 150} direction="up">
                <div className="group flex flex-col rounded-2xl border border-bvi-sand-200 overflow-hidden hover:shadow-xl transition-shadow h-full">
                  {/* Header */}
                  <div className={`${colors.bg} p-6`}>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">{audience.title}</h3>
                  </div>

                  {/* Benefits */}
                  <div className="flex-1 p-6 bg-white">
                    <ul className="space-y-4">
                      {audience.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.bullet} mt-2 flex-shrink-0`} />
                          <span className="text-bvi-granite-500">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="p-6 pt-0">
                    <Link
                      to={audience.href}
                      className={`group/btn w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${colors.bgLight} ${colors.text} font-semibold transition-colors ${colors.hover} hover:text-white`}
                    >
                      {audience.cta}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
