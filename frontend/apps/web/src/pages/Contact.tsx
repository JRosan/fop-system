import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export function Contact() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="landing-container text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bvi-turquoise-500/10 border border-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm font-medium mb-6">
            Get in Touch
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Contact <span className="text-gradient">Our Team</span>
          </h1>
          <p className="text-lg text-bvi-sand-200 max-w-2xl mx-auto">
            Have questions about permits or need assistance? We're here to help aviation authorities and operators.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="landing-section bg-bvi-sand-50">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="font-display text-2xl font-bold text-bvi-atlantic-600 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-bvi-turquoise-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-bvi-atlantic-600 mb-1">Office Address</h3>
                    <p className="text-bvi-granite-500">
                      BVI Civil Aviation Department<br />
                      Road Town, Tortola<br />
                      British Virgin Islands
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-bvi-turquoise-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-bvi-atlantic-600 mb-1">Email</h3>
                    <p className="text-bvi-granite-500">permits@bvicad.vg</p>
                    <p className="text-bvi-granite-500">support@bvicad.vg</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-bvi-turquoise-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-bvi-atlantic-600 mb-1">Phone</h3>
                    <p className="text-bvi-granite-500">+1 (284) 468-2549</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bvi-atlantic-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-bvi-turquoise-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-bvi-atlantic-600 mb-1">Office Hours</h3>
                    <p className="text-bvi-granite-500">Monday - Friday: 8:00 AM - 4:30 PM (AST)</p>
                    <p className="text-bvi-granite-400 text-sm mt-1">Emergency permits available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 border border-bvi-sand-200">
              <h2 className="font-display text-2xl font-bold text-bvi-atlantic-600 mb-6">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="label text-bvi-granite-500">First Name</label>
                    <input type="text" id="firstName" className="input" placeholder="John" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label text-bvi-granite-500">Last Name</label>
                    <input type="text" id="lastName" className="input" placeholder="Smith" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label text-bvi-granite-500">Email Address</label>
                  <input type="email" id="email" className="input" placeholder="john@example.com" />
                </div>

                <div>
                  <label htmlFor="subject" className="label text-bvi-granite-500">Subject</label>
                  <select id="subject" className="input">
                    <option value="">Select a subject...</option>
                    <option value="permit">Permit Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="label text-bvi-granite-500">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    className="input resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-bvi-turquoise-500 text-white font-semibold hover:bg-bvi-turquoise-400 transition-colors shadow-lg shadow-bvi-turquoise-500/25"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
