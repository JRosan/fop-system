import { Shield, Eye, Lock, Database, UserCheck, Globe, Mail } from 'lucide-react';

export function Privacy() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-bvi-atlantic-600 to-bvi-atlantic-700 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="landing-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Your Privacy Matters
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-bvi-sand-200 leading-relaxed">
              How we collect, use, and protect your personal information when you use the BVI Foreign Operator Permit System.
            </p>
            <p className="text-bvi-granite-400 mt-4">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-bvi-granite-600 leading-relaxed mb-8">
                The British Virgin Islands Civil Aviation Department ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Foreign Operator Permit (FOP) System.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-12 mt-12">
              {/* Information We Collect */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-100 flex items-center justify-center">
                    <Database className="w-6 h-6 text-bvi-atlantic-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">Information We Collect</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p><strong>Personal Information:</strong> Name, email address, phone number, company name, and job title when you create an account or submit an application.</p>
                    <p><strong>Aircraft Information:</strong> Registration details, aircraft type, operator certificates, insurance documentation, and airworthiness certificates.</p>
                    <p><strong>Payment Information:</strong> Billing details and transaction records processed through our secure payment system.</p>
                    <p><strong>Usage Data:</strong> IP address, browser type, access times, and pages viewed to improve our services.</p>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-bvi-turquoise-100 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-bvi-turquoise-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">How We Use Your Information</h2>
                  <ul className="text-bvi-granite-600 space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                      Process and manage Foreign Operator Permit applications
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                      Verify operator credentials and aircraft documentation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                      Communicate regarding application status and permit renewals
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                      Process fee payments and issue receipts
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                      Comply with aviation safety regulations and legal requirements
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                      Improve our services and user experience
                    </li>
                  </ul>
                </div>
              </div>

              {/* Data Protection */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-success-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">Data Protection & Security</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>We implement industry-standard security measures to protect your data:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        TLS 1.3 encryption for all data in transit
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        AES-256 encryption for data at rest
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        Regular security audits and penetration testing
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        Role-based access controls for system administrators
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        Comprehensive audit logging of all system activities
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-bvi-gold-100 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-bvi-gold-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">Your Rights</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>You have the following rights regarding your personal data:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        <strong>Access:</strong> Request a copy of your personal data
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        <strong>Correction:</strong> Request correction of inaccurate data
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        <strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        <strong>Portability:</strong> Request transfer of your data in a standard format
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Sharing */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">Data Sharing & Disclosure</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>We may share your information with:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                        International aviation authorities for permit verification
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                        Payment processors for transaction handling
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                        Law enforcement when required by law
                      </li>
                    </ul>
                    <p className="mt-4">We do not sell your personal information to third parties.</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-bvi-atlantic-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">Contact Us</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>For privacy-related inquiries or to exercise your rights, please contact:</p>
                    <div className="bg-bvi-sand-50 rounded-xl p-6 mt-4">
                      <p className="font-semibold text-bvi-atlantic-600">Data Protection Officer</p>
                      <p>BVI Civil Aviation Department</p>
                      <p>Road Town, Tortola</p>
                      <p>British Virgin Islands</p>
                      <p className="mt-2">
                        <a href="mailto:privacy@bvicad.vg" className="text-bvi-turquoise-600 hover:text-bvi-turquoise-700">
                          privacy@bvicad.vg
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
