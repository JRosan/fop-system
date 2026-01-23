import { Link } from 'react-router-dom';
import { ClipboardCheck, PieChart, Plane, ArrowRight } from 'lucide-react';

const audiences = [
  {
    icon: ClipboardCheck,
    title: 'Civil Aviation Officers',
    color: 'blue',
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
    color: 'green',
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
    color: 'purple',
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
  blue: {
    bg: 'bg-primary-500',
    bgLight: 'bg-primary-50',
    text: 'text-primary-600',
    border: 'border-primary-200',
    bullet: 'bg-primary-500',
  },
  green: {
    bg: 'bg-success-500',
    bgLight: 'bg-success-50',
    text: 'text-success-600',
    border: 'border-success-200',
    bullet: 'bg-success-500',
  },
  purple: {
    bg: 'bg-status-underReview',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    bullet: 'bg-purple-500',
  },
};

export function AudienceSection() {
  return (
    <section className="landing-section bg-white">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-av-navy-900/10 text-av-navy-900 text-sm font-medium mb-4">
            Built for Everyone
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-av-navy-900 mb-4">
            Designed for Your Role
          </h2>
          <p className="text-lg text-av-cloud-600 max-w-2xl mx-auto">
            Purpose-built interfaces and workflows tailored to the unique needs of each stakeholder in the aviation ecosystem.
          </p>
        </div>

        {/* Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience) => {
            const Icon = audience.icon;
            const colors = colorClasses[audience.color as keyof typeof colorClasses];
            return (
              <div
                key={audience.title}
                className="group flex flex-col rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className={`${colors.bg} p-6`}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{audience.title}</h3>
                </div>

                {/* Benefits */}
                <div className="flex-1 p-6 bg-white">
                  <ul className="space-y-4">
                    {audience.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.bullet} mt-2 flex-shrink-0`} />
                        <span className="text-av-cloud-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  <Link
                    to={audience.href}
                    className={`group/btn w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${colors.bgLight} ${colors.text} font-semibold hover:${colors.bg} hover:text-white transition-colors`}
                  >
                    {audience.cta}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
