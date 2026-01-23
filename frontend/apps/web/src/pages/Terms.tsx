import { FileText, CheckCircle, AlertTriangle, Scale, Clock, Ban, Mail } from 'lucide-react';

export function Terms() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-bvi-atlantic-600 to-bvi-atlantic-700 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="landing-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal Agreement
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-bvi-sand-200 leading-relaxed">
              Please read these terms carefully before using the BVI Foreign Operator Permit System.
            </p>
            <p className="text-bvi-granite-400 mt-4">
              Effective Date: January 2025
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
                These Terms of Service ("Terms") govern your use of the Foreign Operator Permit System ("Service") operated by the British Virgin Islands Civil Aviation Department ("BVI CAD", "we", "us", or "our"). By accessing or using the Service, you agree to be bound by these Terms.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-12 mt-12">
              {/* Acceptance of Terms */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-bvi-atlantic-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">1. Acceptance of Terms</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>By accessing and using this Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Service.</p>
                    <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
                  </div>
                </div>
              </div>

              {/* Use of Service */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-bvi-turquoise-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-bvi-turquoise-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">2. Use of the Service</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>The Service is provided for the purpose of:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                        Submitting applications for Foreign Operator Permits
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                        Uploading required documentation and certificates
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                        Processing permit fee payments
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                        Managing and tracking permit applications and renewals
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-500 mt-2.5 flex-shrink-0" />
                        Verifying the validity of issued permits
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* User Responsibilities */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-bvi-gold-100 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-bvi-gold-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">3. User Responsibilities</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>As a user of the Service, you agree to:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        Provide accurate, current, and complete information in all applications
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        Maintain the confidentiality of your account credentials
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        Submit only authentic and valid documentation
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        Comply with all applicable aviation regulations and laws
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-bvi-gold-500 mt-2.5 flex-shrink-0" />
                        Notify us immediately of any unauthorized use of your account
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Fees and Payments */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-success-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">4. Fees and Payments</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>Permit fees are calculated based on:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        Permit type (One-Time, Blanket, or Emergency)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        Aircraft specifications (seating capacity and MTOW)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2.5 flex-shrink-0" />
                        Current fee schedule as published by BVI CAD
                      </li>
                    </ul>
                    <p className="mt-4">All fees are non-refundable once a permit has been issued. Payment must be received before permit issuance.</p>
                  </div>
                </div>
              </div>

              {/* Prohibited Activities */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-error-100 flex items-center justify-center">
                    <Ban className="w-6 h-6 text-error-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">5. Prohibited Activities</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>You may not use the Service to:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-error-500 mt-2.5 flex-shrink-0" />
                        Submit false, misleading, or fraudulent information
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-error-500 mt-2.5 flex-shrink-0" />
                        Forge, alter, or misuse permits or documentation
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-error-500 mt-2.5 flex-shrink-0" />
                        Attempt to gain unauthorized access to the system
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-error-500 mt-2.5 flex-shrink-0" />
                        Interfere with or disrupt the Service's operation
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-error-500 mt-2.5 flex-shrink-0" />
                        Violate any applicable laws or regulations
                      </li>
                    </ul>
                    <p className="mt-4 font-medium text-error-600">Violation of these prohibitions may result in immediate account termination, permit revocation, and potential legal action.</p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">6. Disclaimer & Limitation of Liability</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>The Service is provided "as is" without warranties of any kind. While we strive for accuracy and reliability:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-2.5 flex-shrink-0" />
                        We do not guarantee uninterrupted or error-free service
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-2.5 flex-shrink-0" />
                        Processing times are estimates and not guaranteed
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-2.5 flex-shrink-0" />
                        BVI CAD shall not be liable for indirect or consequential damages
                      </li>
                    </ul>
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
                  <h2 className="text-2xl font-semibold text-bvi-atlantic-600 mb-4">7. Contact Information</h2>
                  <div className="text-bvi-granite-600 space-y-4">
                    <p>For questions about these Terms, please contact:</p>
                    <div className="bg-bvi-sand-50 rounded-xl p-6 mt-4">
                      <p className="font-semibold text-bvi-atlantic-600">Legal Department</p>
                      <p>BVI Civil Aviation Department</p>
                      <p>Road Town, Tortola</p>
                      <p>British Virgin Islands</p>
                      <p className="mt-2">
                        <a href="mailto:legal@bvicad.vg" className="text-bvi-turquoise-600 hover:text-bvi-turquoise-700">
                          legal@bvicad.vg
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
