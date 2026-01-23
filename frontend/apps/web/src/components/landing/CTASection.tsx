import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { AnimatedSection } from '../AnimatedSection';

export function CTASection() {
  return (
    <section className="landing-section bg-gateway-flow relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-bvi-turquoise-500/10 rounded-full blur-[200px]" />
      </div>

      <div className="relative landing-container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <AnimatedSection>
            <span className="inline-block px-4 py-1.5 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm font-medium mb-8">
              Get Started Today
            </span>
          </AnimatedSection>

          {/* Headline */}
          <AnimatedSection delay={100}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Modernize Your{' '}
              <span className="text-gradient">Aviation Authority?</span>
            </h2>
          </AnimatedSection>

          {/* Description */}
          <AnimatedSection delay={200}>
            <p className="text-lg text-bvi-sand-200 mb-10 max-w-xl mx-auto">
              Join leading Caribbean aviation authorities using the FOP System to streamline operations,
              maximize revenue, and ensure compliance.
            </p>
          </AnimatedSection>

          {/* CTAs */}
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to="/app/applications/new"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-bvi-turquoise-500 text-white hover:bg-bvi-turquoise-400 transition-all shadow-lg shadow-bvi-turquoise-500/25 hover:shadow-bvi-turquoise-500/40"
              >
                Start Your Application
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold rounded-xl border-2 border-bvi-sand-400 text-white hover:border-bvi-turquoise-500 hover:text-bvi-turquoise-400 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Sales
              </Link>
            </div>
          </AnimatedSection>

          {/* Quick Stats */}
          <AnimatedSection delay={400}>
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-bvi-atlantic-400/30">
              <div>
                <p className="text-3xl font-mono font-bold text-white mb-1">500+</p>
                <p className="text-bvi-sand-300 text-sm">Permits Processed</p>
              </div>
              <div>
                <p className="text-3xl font-mono font-bold text-bvi-gold-400 mb-1">$2M+</p>
                <p className="text-bvi-sand-300 text-sm">Revenue Collected</p>
              </div>
              <div>
                <p className="text-3xl font-mono font-bold text-white mb-1">24/7</p>
                <p className="text-bvi-sand-300 text-sm">System Availability</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
