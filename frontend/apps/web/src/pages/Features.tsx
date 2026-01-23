import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck, Calculator, Shield, BarChart3, Clock, Globe } from 'lucide-react';

const features = [
  {
    icon: FileCheck,
    title: 'Permit Management',
    description: 'Complete lifecycle management for One-Time, Blanket, and Emergency permits with automated workflows and compliance tracking.',
  },
  {
    icon: Calculator,
    title: 'Intelligent Fee Calculation',
    description: 'Automated fee computation based on aircraft specifications, permit type, and regulatory requirements with full audit trail.',
  },
  {
    icon: Shield,
    title: 'Insurance Verification',
    description: 'Automated insurance policy validation with coverage verification and expiration monitoring.',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    description: 'Comprehensive dashboards and reports for tracking permit revenue, trends, and forecasting.',
  },
  {
    icon: Clock,
    title: 'Real-time Tracking',
    description: 'Live application status updates for operators and authorities with automated notifications.',
  },
  {
    icon: Globe,
    title: 'Multi-Tenant Support',
    description: 'Serve multiple aviation authorities from a single platform with isolated data and custom branding.',
  },
];

export function Features() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-av-navy-900 py-20 md:py-28">
        <div className="landing-container text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-av-cyan-500/10 border border-av-cyan-500/20 text-av-cyan-400 text-sm font-medium mb-6">
            Platform Features
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything You Need to{' '}
            <span className="text-gradient">Manage Aviation Permits</span>
          </h1>
          <p className="text-lg text-av-cloud-300 max-w-2xl mx-auto">
            A comprehensive suite of tools designed specifically for Caribbean aviation authorities and operators.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-section bg-white">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-8 rounded-2xl border border-neutral-200 hover:border-av-cyan-500/50 hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-av-navy-900 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-av-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-av-navy-900 mb-3">{feature.title}</h3>
                  <p className="text-av-cloud-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section bg-av-cloud-50">
        <div className="landing-container text-center">
          <h2 className="text-3xl font-bold text-av-navy-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-av-cloud-600 mb-8 max-w-xl mx-auto">
            Join aviation authorities across the Caribbean using the FOP System.
          </p>
          <Link
            to="/app/applications/new"
            className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-av-cyan-500 text-av-navy-900 hover:bg-av-cyan-400 transition-all shadow-lg shadow-av-cyan-500/25"
          >
            Start Your Application
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
