import { Cloud, Lock, FileSearch, Zap, Database, Globe } from 'lucide-react';

const features = [
  {
    icon: Cloud,
    title: 'Azure Cloud Native',
    description: 'Enterprise-grade infrastructure with 99.9% uptime SLA and global CDN distribution.',
  },
  {
    icon: Lock,
    title: 'TLS 1.3 Encryption',
    description: 'End-to-end encryption for all data in transit with certificate pinning support.',
  },
  {
    icon: FileSearch,
    title: 'Complete Audit Logs',
    description: 'Immutable audit trail for every action with tamper-evident logging and compliance reporting.',
  },
  {
    icon: Zap,
    title: 'Modern API Stack',
    description: '.NET 10 backend with OpenAPI documentation and SDK generation for integrations.',
  },
  {
    icon: Database,
    title: 'SQL Server Enterprise',
    description: 'ACID-compliant database with automatic backups, point-in-time recovery, and geo-replication.',
  },
  {
    icon: Globe,
    title: 'Multi-Tenant Architecture',
    description: 'Securely serve multiple aviation authorities with isolated data and customizable branding.',
  },
];

const badges = [
  { label: 'Microsoft Azure', icon: '/' },
  { label: 'SOC 2 Type II', icon: '/' },
  { label: 'ISO 27001', icon: '/' },
  { label: 'GDPR Ready', icon: '/' },
];

export function TechnologySection() {
  return (
    <section className="landing-section bg-av-navy-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-av-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-av-cyan-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative landing-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-av-cyan-500/10 border border-av-cyan-500/20 text-av-cyan-400 text-sm font-medium mb-4">
            Enterprise Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Built on Modern Technology
          </h2>
          <p className="text-lg text-av-cloud-300 max-w-2xl mx-auto">
            Secure, scalable, and compliant infrastructure designed for government and enterprise aviation operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-av-navy-800/50 border border-av-navy-700 hover:border-av-cyan-500/30 transition-all glow-border-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-av-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-av-cyan-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-av-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-av-cloud-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-av-navy-800/50 border border-av-navy-700"
            >
              <div className="w-8 h-8 rounded-lg bg-av-cloud-100 flex items-center justify-center">
                <span className="text-av-navy-900 text-xs font-bold">
                  {badge.label.split(' ')[0].charAt(0)}
                </span>
              </div>
              <span className="text-av-cloud-300 text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
