import { useState } from 'react';
import { Send, Smartphone, CheckCircle } from 'lucide-react';
import { Modal } from '../Modal';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAccessModal({ isOpen, onClose }: MobileAccessModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', organization: '', role: '', message: '' });
      onClose();
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Request Submitted">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bvi-turquoise-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-bvi-turquoise-500" />
          </div>
          <h3 className="text-lg font-semibold text-bvi-atlantic-600 mb-2">Thank You!</h3>
          <p className="text-bvi-granite-500">
            We've received your request. Our team will contact you within 24-48 hours.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Mobile Access">
      <div className="mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-bvi-turquoise-50 border border-bvi-turquoise-200">
          <Smartphone className="w-5 h-5 text-bvi-turquoise-500" />
          <p className="text-sm text-bvi-turquoise-700">
            Get access to field verification, fee logging, and compliance alerts on your mobile device.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-bvi-granite-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-bvi-granite-300 focus:border-bvi-turquoise-500 focus:ring-2 focus:ring-bvi-turquoise-500/20 outline-none transition-all"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-bvi-granite-600 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-bvi-granite-300 focus:border-bvi-turquoise-500 focus:ring-2 focus:ring-bvi-turquoise-500/20 outline-none transition-all"
              placeholder="john@aviation.gov"
            />
          </div>
        </div>

        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-bvi-granite-600 mb-1">
            Organization *
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            required
            value={formData.organization}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-bvi-granite-300 focus:border-bvi-turquoise-500 focus:ring-2 focus:ring-bvi-turquoise-500/20 outline-none transition-all"
            placeholder="BVI Civil Aviation Department"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-bvi-granite-600 mb-1">
            Role *
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-bvi-granite-300 focus:border-bvi-turquoise-500 focus:ring-2 focus:ring-bvi-turquoise-500/20 outline-none transition-all bg-white"
          >
            <option value="">Select your role</option>
            <option value="aviation_officer">Aviation Officer</option>
            <option value="ramp_inspector">Ramp Inspector</option>
            <option value="finance_officer">Finance Officer</option>
            <option value="pilot">Pilot / Operator</option>
            <option value="administrator">Administrator</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-bvi-granite-600 mb-1">
            Additional Information
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-bvi-granite-300 focus:border-bvi-turquoise-500 focus:ring-2 focus:ring-bvi-turquoise-500/20 outline-none transition-all resize-none"
            placeholder="Tell us about your use case..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-bvi-granite-300 text-bvi-granite-600 font-medium hover:bg-bvi-sand-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl bg-bvi-gold-500 text-bvi-atlantic-900 font-semibold hover:bg-bvi-gold-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-bvi-atlantic-900/30 border-t-bvi-atlantic-900 rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
