import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { FloatingDashboard } from './FloatingDashboard';

// Aerial view of Caribbean airport with ocean and surrounding islands
// Wide shot capturing turquoise waters, runway, and island landscape
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=2070&q=80';

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
      />

      {/* Gradient Overlay - Deep Atlantic fade */}
      <div className="absolute inset-0 bg-gradient-to-br from-bvi-atlantic-600/95 via-bvi-atlantic-600/85 to-bvi-turquoise-500/70" />

      {/* Secondary gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-bvi-atlantic-600 via-transparent to-transparent" />

      {/* Background Glow Effects - Caribbean water glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-bvi-turquoise-500/20 rounded-full blur-[128px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-bvi-turquoise-500/15 rounded-full blur-[128px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bvi-gold-500/5 rounded-full blur-[200px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 163, 177, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 163, 177, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative landing-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-80px)] py-12">
          {/* Left Column - Copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-bvi-turquoise-400 animate-pulse" />
              <span className="text-bvi-turquoise-400 text-sm font-medium">
                Caribbean Aviation Authority Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              One Platform.
              <br />
              <span className="text-gradient">Every Permit.</span>
              <br />
              Total Compliance.
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-bvi-sand-200 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              The premier regulatory technology platform empowering Caribbean aviation authorities
              with automated permit processing, intelligent fee calculation, and real-time compliance monitoring.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/app/applications/new"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-bvi-turquoise-500 text-white hover:bg-bvi-turquoise-400 transition-all shadow-lg shadow-bvi-turquoise-500/25 hover:shadow-bvi-turquoise-500/40"
              >
                Start Application
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                type="button"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold rounded-xl border-2 border-bvi-sand-400 text-white hover:border-bvi-turquoise-500 hover:text-bvi-turquoise-400 transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-bvi-turquoise-500/20 transition-colors">
                  <Play className="w-4 h-4 ml-0.5" />
                </span>
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-bvi-atlantic-400/30">
              <p className="text-bvi-sand-300 text-sm mb-4">Trusted by aviation authorities across the Caribbean</p>
              <div className="flex items-center justify-center lg:justify-start gap-8">
                <div className="text-bvi-sand-200 text-sm font-medium">BVI CAD</div>
                <div className="w-px h-4 bg-bvi-atlantic-400" />
                <div className="text-bvi-sand-200 text-sm font-medium">ECCAA</div>
                <div className="w-px h-4 bg-bvi-atlantic-400" />
                <div className="text-bvi-sand-200 text-sm font-medium">Regional Partners</div>
              </div>
            </div>
          </div>

          {/* Right Column - Floating Dashboard */}
          <div className="relative hidden lg:block">
            <FloatingDashboard />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-bvi-sand-300 text-xs uppercase tracking-widest">Explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-bvi-sand-400 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-bvi-turquoise-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
