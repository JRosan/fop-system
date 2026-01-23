import { useState, useEffect } from 'react';
import { QrCode, DollarSign, Bell, ArrowRight, Smartphone } from 'lucide-react';
import { AnimatedSection } from '../AnimatedSection';
import { DeviceMockup, QRScannerScreen, VerifiedScreen, FeeLoggerScreen } from './DeviceMockup';

const features = [
  {
    icon: QrCode,
    title: 'Instant Field Verification',
    description: 'Scan any permit for real-time validity checks, even with limited connectivity.',
    color: 'turquoise' as const,
  },
  {
    icon: DollarSign,
    title: 'Capture Every Fee',
    description: 'Log ground services, fuel flow, and hangar fees the moment they occur. Zero leakage, maximum revenue.',
    color: 'gold' as const,
  },
  {
    icon: Bell,
    title: 'Critical Compliance',
    description: 'Receive instant push notifications for insurance expirations and emergency permit approvals.',
    color: 'atlantic' as const,
  },
];

const colorClasses = {
  turquoise: {
    iconBg: 'bg-bvi-turquoise-500/20',
    iconText: 'text-bvi-turquoise-500',
    border: 'hover:border-bvi-turquoise-500/30',
  },
  gold: {
    iconBg: 'bg-bvi-gold-500/20',
    iconText: 'text-bvi-gold-500',
    border: 'hover:border-bvi-gold-500/30',
  },
  atlantic: {
    iconBg: 'bg-bvi-atlantic-400/20',
    iconText: 'text-bvi-atlantic-300',
    border: 'hover:border-bvi-atlantic-400/30',
  },
};

const screens = [
  { id: 'scanner', label: 'Scan', component: QRScannerScreen },
  { id: 'verified', label: 'Verify', component: VerifiedScreen },
  { id: 'fees', label: 'Fees', component: FeeLoggerScreen },
] as const;

export function MobileShowcase() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle between screens (pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="landing-section relative overflow-hidden bg-gradient-to-br from-bvi-atlantic-700 via-bvi-atlantic-600 to-bvi-turquoise-600">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-bvi-turquoise-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-bvi-atlantic-400/20 blur-3xl" />
      </div>

      <div className="landing-container relative z-10">
        {/* Two-column layout: Device + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Device Mockup - Left side on desktop */}
          <AnimatedSection direction="left" className="order-2 lg:order-1">
            <div
              className="flex flex-col items-center gap-6"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <DeviceMockup>
                {/* Screen container with crossfade */}
                <div className="relative w-full h-full">
                  {screens.map((screen, index) => {
                    const ScreenComponent = screen.component;
                    return (
                      <div
                        key={screen.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          activeScreen === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <ScreenComponent />
                      </div>
                    );
                  })}
                </div>
              </DeviceMockup>

              {/* Screen indicator dots with progress */}
              <div className="flex items-center gap-3">
                {screens.map((screen, index) => (
                  <button
                    key={screen.id}
                    onClick={() => setActiveScreen(index)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                      activeScreen === index
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-transparent hover:bg-white/10'
                    }`}
                    aria-label={`View ${screen.label} screen`}
                  >
                    {/* Dot with circular progress */}
                    <span className="relative w-4 h-4 flex items-center justify-center">
                      {/* Progress ring (only on active) */}
                      {activeScreen === index && (
                        <svg
                          className="absolute inset-0 w-4 h-4 -rotate-90"
                          viewBox="0 0 16 16"
                        >
                          {/* Background ring */}
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/20"
                          />
                          {/* Progress ring */}
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="text-bvi-turquoise-400"
                            strokeDasharray={2 * Math.PI * 6}
                            strokeDashoffset={2 * Math.PI * 6}
                            style={{
                              animation: isPaused ? 'none' : 'progress-ring 4s linear forwards',
                            }}
                          />
                        </svg>
                      )}
                      {/* Center dot */}
                      <span
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          activeScreen === index
                            ? 'bg-bvi-turquoise-400 shadow-lg shadow-bvi-turquoise-400/50'
                            : 'bg-white/40 group-hover:bg-white/60'
                        }`}
                      />
                    </span>
                    <span
                      className={`text-xs font-medium transition-colors duration-300 ${
                        activeScreen === index ? 'text-white' : 'text-white/50 group-hover:text-white/70'
                      }`}
                    >
                      {screen.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Progress ring animation keyframes */}
              <style>{`
                @keyframes progress-ring {
                  from {
                    stroke-dashoffset: ${2 * Math.PI * 6};
                  }
                  to {
                    stroke-dashoffset: 0;
                  }
                }
              `}</style>
            </div>
          </AnimatedSection>

          {/* Content - Right side on desktop */}
          <div className="order-1 lg:order-2">
            {/* Header */}
            <AnimatedSection className="mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-bvi-turquoise-300 text-sm font-medium mb-6">
                <Smartphone className="w-4 h-4" />
                Mobile Extension
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Control the Skies from the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-bvi-turquoise-300 to-bvi-turquoise-500">
                  Palm of Your Hand
                </span>
              </h2>
              <p className="text-lg text-white/70 leading-relaxed">
                Our mobile extension brings the power of the BVI FOP system to the ramp. Whether you're an officer verifying compliance or a pilot updating insurance, the gateway is always open.
              </p>
            </AnimatedSection>

            {/* Key Metric */}
            <AnimatedSection delay={200} className="mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-3xl font-bold text-bvi-gold-400 font-mono">85%</div>
                <div className="text-white/70 text-sm leading-tight">
                  Reduction in field<br />verification time
                </div>
              </div>
            </AnimatedSection>

            {/* Feature Cards - Bento Grid */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const colors = colorClasses[feature.color];
                return (
                  <AnimatedSection
                    key={feature.title}
                    delay={300 + index * 100}
                    direction="right"
                  >
                    <div
                      className={`group p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 ${colors.border}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                          <feature.icon className={`w-6 h-6 ${colors.iconText}`} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                          <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Store badges, ML teaser, CTA */}
        <div className="mt-16 lg:mt-24">
          {/* Trust Elements - App Store Badges */}
          <AnimatedSection delay={600} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {/* App Store Badge (monochrome) */}
            <a
              href="#"
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors group"
              aria-label="Download on App Store"
            >
              <svg className="w-7 h-7 text-white/80 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-white/60 uppercase tracking-wide">Download on the</div>
                <div className="text-sm text-white font-semibold -mt-0.5">App Store</div>
              </div>
            </a>

            {/* Google Play Badge (monochrome) */}
            <a
              href="#"
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors group"
              aria-label="Get it on Google Play"
            >
              <svg className="w-7 h-7 text-white/80 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-white/60 uppercase tracking-wide">Get it on</div>
                <div className="text-sm text-white font-semibold -mt-0.5">Google Play</div>
              </div>
            </a>

            <span className="text-white/40 text-sm">Enterprise distribution available</span>
          </AnimatedSection>

          {/* ML Teaser */}
          <AnimatedSection delay={700} className="text-center mb-10">
            <div className="inline-block max-w-2xl mx-auto px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-bvi-turquoise-500/20">
              <p className="text-white/70 text-sm leading-relaxed">
                <span className="text-bvi-turquoise-400 font-medium">AI-Powered Insights:</span>{' '}
                Every mobile interaction feeds our ML engine, providing unprecedented heat-maps of operational activity and compliance trends.
              </p>
            </div>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection delay={800} className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#request-access"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-bvi-gold-500 text-bvi-atlantic-900 font-semibold text-sm hover:bg-bvi-gold-400 transition-colors shadow-lg shadow-bvi-gold-500/25"
            >
              Request Mobile Access
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/15 transition-colors border border-white/10"
            >
              View Mobile Demo
            </a>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
