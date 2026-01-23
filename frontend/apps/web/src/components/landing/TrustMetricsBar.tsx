import { Shield, Clock, TrendingUp } from 'lucide-react';

const metrics = [
  {
    icon: Shield,
    value: '100%',
    label: 'Insurance Detection',
    description: 'Automated policy verification',
  },
  {
    icon: Clock,
    value: '<24hr',
    label: 'Turnaround',
    description: 'Average processing time',
  },
  {
    icon: TrendingUp,
    value: '+15%',
    label: 'Revenue Capture',
    description: 'Improved fee collection',
  },
];

export function TrustMetricsBar() {
  return (
    <section className="bg-bvi-sand-50 border-y border-bvi-sand-200">
      <div className="landing-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-bvi-atlantic-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-bvi-turquoise-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-bvi-atlantic-600">{metric.value}</span>
                    <span className="text-sm font-semibold text-bvi-granite-500">{metric.label}</span>
                  </div>
                  <p className="text-bvi-granite-400 text-sm">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
