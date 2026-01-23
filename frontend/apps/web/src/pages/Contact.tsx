import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export function Contact() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-av-navy-900 py-20 md:py-28">
        <div className="landing-container text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-av-cyan-500/10 border border-av-cyan-500/20 text-av-cyan-400 text-sm font-medium mb-6">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Contact <span className="text-gradient">Our Team</span>
          </h1>
          <p className="text-lg text-av-cloud-300 max-w-2xl mx-auto">
            Have questions about permits or need assistance? We're here to help aviation authorities and operators.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="landing-section bg-white">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-av-navy-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-av-navy-900 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-av-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-av-navy-900 mb-1">Office Address</h3>
                    <p className="text-av-cloud-600">
                      BVI Civil Aviation Department<br />
                      Road Town, Tortola<br />
                      British Virgin Islands
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-av-navy-900 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-av-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-av-navy-900 mb-1">Email</h3>
                    <p className="text-av-cloud-600">permits@bvicad.vg</p>
                    <p className="text-av-cloud-600">support@bvicad.vg</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-av-navy-900 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-av-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-av-navy-900 mb-1">Phone</h3>
                    <p className="text-av-cloud-600">+1 (284) 468-2549</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-av-navy-900 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-av-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-av-navy-900 mb-1">Office Hours</h3>
                    <p className="text-av-cloud-600">Monday - Friday: 8:00 AM - 4:30 PM (AST)</p>
                    <p className="text-av-cloud-500 text-sm mt-1">Emergency permits available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-av-navy-900 mb-6">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="label">First Name</label>
                    <input type="text" id="firstName" className="input" placeholder="John" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label">Last Name</label>
                    <input type="text" id="lastName" className="input" placeholder="Smith" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input type="email" id="email" className="input" placeholder="john@example.com" />
                </div>

                <div>
                  <label htmlFor="subject" className="label">Subject</label>
                  <select id="subject" className="input">
                    <option value="">Select a subject...</option>
                    <option value="permit">Permit Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="label">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    className="input resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-av-cyan-500 text-av-navy-900 font-semibold hover:bg-av-cyan-400 transition-colors shadow-lg shadow-av-cyan-500/25"
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
