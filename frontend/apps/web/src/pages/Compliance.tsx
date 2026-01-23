import { Shield, Globe, FileCheck, Award, Building, Plane, CheckCircle } from 'lucide-react';

export function Compliance() {
  const standards = [
    {
      icon: Globe,
      title: 'ICAO Standards',
      description: 'Full compliance with International Civil Aviation Organization standards and recommended practices (SARPs).',
      items: ['Annex 6 - Operation of Aircraft', 'Annex 8 - Airworthiness', 'Annex 9 - Facilitation'],
    },
    {
      icon: Building,
      title: 'OECS Aviation',
      description: 'Aligned with Organisation of Eastern Caribbean States aviation regulatory framework.',
      items: ['Regional cooperation protocols', 'Mutual recognition agreements', 'Harmonized procedures'],
    },
    {
      icon: FileCheck,
      title: 'Data Protection',
      description: 'Adherence to international data protection standards and best practices.',
      items: ['GDPR principles', 'Data minimization', 'Purpose limitation', 'Storage limitation'],
    },
    {
      icon: Shield,
      title: 'Security Standards',
      description: 'Enterprise-grade security meeting international cybersecurity frameworks.',
      items: ['ISO 27001 aligned', 'SOC 2 Type II controls', 'Regular penetration testing'],
    },
  ];

  const certifications = [
    { name: 'ICAO Member State', status: 'Active' },
    { name: 'IATA Operational Safety Audit', status: 'Recognized' },
    { name: 'FAA Category 1 Rating', status: 'Maintained' },
    { name: 'EASA Third Country Operator', status: 'Approved' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-bvi-atlantic-600 to-bvi-atlantic-700 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="landing-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Regulatory Excellence
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Compliance & Standards
            </h1>
            <p className="text-xl text-bvi-sand-200 leading-relaxed">
              The BVI FOP System is built on a foundation of international aviation standards and regulatory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-bvi-atlantic-600 mb-4">
                Our Commitment to Excellence
              </h2>
              <p className="text-lg text-bvi-granite-600 leading-relaxed">
                The British Virgin Islands Civil Aviation Department maintains the highest standards of regulatory compliance, ensuring safe and efficient air operations throughout our territory.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="text-center p-6 bg-bvi-sand-50 rounded-xl">
                <p className="text-3xl font-bold text-bvi-atlantic-600">100%</p>
                <p className="text-sm text-bvi-granite-500 mt-1">ICAO Compliance</p>
              </div>
              <div className="text-center p-6 bg-bvi-sand-50 rounded-xl">
                <p className="text-3xl font-bold text-bvi-atlantic-600">Cat 1</p>
                <p className="text-sm text-bvi-granite-500 mt-1">FAA Safety Rating</p>
              </div>
              <div className="text-center p-6 bg-bvi-sand-50 rounded-xl">
                <p className="text-3xl font-bold text-bvi-atlantic-600">24/7</p>
                <p className="text-sm text-bvi-granite-500 mt-1">System Monitoring</p>
              </div>
              <div className="text-center p-6 bg-bvi-sand-50 rounded-xl">
                <p className="text-3xl font-bold text-bvi-atlantic-600">256-bit</p>
                <p className="text-sm text-bvi-granite-500 mt-1">Encryption</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standards Grid */}
      <section className="py-16 md:py-24 bg-bvi-sand-50">
        <div className="landing-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-bvi-atlantic-600 mb-4">
              Standards & Frameworks
            </h2>
            <p className="text-lg text-bvi-granite-600">
              Our system adheres to multiple international standards and frameworks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {standards.map((standard, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-bvi-sand-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-100 flex items-center justify-center flex-shrink-0">
                    <standard.icon className="w-6 h-6 text-bvi-atlantic-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-bvi-atlantic-600 mb-2">
                      {standard.title}
                    </h3>
                    <p className="text-bvi-granite-600 mb-4">{standard.description}</p>
                    <ul className="space-y-2">
                      {standard.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-bvi-granite-500">
                          <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24 bg-white">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-bvi-atlantic-600 mb-4">
                Certifications & Recognition
              </h2>
              <p className="text-lg text-bvi-granite-600">
                The BVI Civil Aviation Department holds the following international certifications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 bg-bvi-sand-50 rounded-xl border border-bvi-sand-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-bvi-granite-700">{cert.name}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success-100 text-success-700 text-sm font-medium">
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audit Process */}
      <section className="py-16 md:py-24 bg-bvi-atlantic-600">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-6">
              Continuous Compliance
            </h2>
            <p className="text-xl text-bvi-sand-200 mb-12">
              Our commitment to compliance is demonstrated through regular audits and continuous improvement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="w-16 h-16 rounded-2xl bg-bvi-turquoise-500/20 flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-bvi-turquoise-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Regular Audits</h3>
                <p className="text-bvi-sand-200 text-sm">
                  Annual internal and external audits to verify compliance with all applicable standards.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="w-16 h-16 rounded-2xl bg-bvi-turquoise-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-bvi-turquoise-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Security Testing</h3>
                <p className="text-bvi-sand-200 text-sm">
                  Quarterly penetration testing and vulnerability assessments by certified professionals.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="w-16 h-16 rounded-2xl bg-bvi-turquoise-500/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-bvi-turquoise-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Certification Renewal</h3>
                <p className="text-bvi-sand-200 text-sm">
                  Proactive renewal of all certifications well ahead of expiration dates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="landing-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-bvi-atlantic-600 mb-4">
              Questions About Compliance?
            </h2>
            <p className="text-lg text-bvi-granite-600 mb-8">
              Our regulatory team is available to answer any questions about our compliance standards and certifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:compliance@bvicad.vg"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-bvi-atlantic-600 text-white font-medium hover:bg-bvi-atlantic-700 transition-colors"
              >
                Contact Compliance Team
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-bvi-atlantic-600 text-bvi-atlantic-600 font-medium hover:bg-bvi-atlantic-50 transition-colors"
              >
                General Inquiries
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
