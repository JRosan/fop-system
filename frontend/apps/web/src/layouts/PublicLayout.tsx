import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Plane } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bvi-sand-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bvi-atlantic-600/95 backdrop-blur-md border-b border-bvi-turquoise-500/10">
        <nav className="landing-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bvi-turquoise-500 to-bvi-turquoise-600 flex items-center justify-center shadow-lg shadow-bvi-turquoise-500/25 group-hover:shadow-bvi-turquoise-500/40 transition-shadow">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-display font-semibold text-lg">BVI Aviation</span>
                <span className="text-bvi-turquoise-400 text-sm block -mt-1">FOP System</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'text-bvi-turquoise-400'
                      : 'text-bvi-sand-200 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/app/dashboard"
                className="text-sm font-medium text-bvi-sand-200 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/app/applications/new"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-bvi-turquoise-500 text-white hover:bg-bvi-turquoise-400 transition-colors shadow-lg shadow-bvi-turquoise-500/25"
              >
                Start Application
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 text-bvi-sand-200 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-bvi-atlantic-600/98 border-t border-bvi-turquoise-500/10">
            <div className="landing-container py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block py-2 text-base font-medium ${
                    location.pathname === link.href
                      ? 'text-bvi-turquoise-400'
                      : 'text-bvi-sand-200'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-bvi-atlantic-500 space-y-3">
                <Link
                  to="/app/dashboard"
                  className="block py-2 text-base font-medium text-bvi-sand-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/app/applications/new"
                  className="block w-full py-3 text-center text-base font-medium rounded-lg bg-bvi-turquoise-500 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Application
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-bvi-atlantic-950 border-t border-bvi-atlantic-700">
        <div className="landing-container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bvi-turquoise-500 to-bvi-turquoise-600 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white font-display font-semibold">BVI Aviation</span>
                  <span className="text-bvi-turquoise-400 text-sm block -mt-1">FOP System</span>
                </div>
              </Link>
              <p className="text-bvi-granite-300 text-sm leading-relaxed">
                Premier regulatory technology platform for Caribbean aviation authorities.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/features" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/app/applications/new" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Apply Now
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-bvi-granite-300 hover:text-white text-sm transition-colors">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-bvi-atlantic-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-bvi-granite-400 text-sm">
              &copy; {new Date().getFullYear()} British Virgin Islands Civil Aviation Department. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-bvi-granite-400 text-sm">Powered by RegTech Innovation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
