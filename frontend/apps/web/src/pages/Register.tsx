import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Mail, User, Phone, Building2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@fop/api';

interface RegisterForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
}

type Step = 'form' | 'success' | 'error';

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/auth/register', {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || null,
        companyName: form.companyName || null,
      });

      setStep('success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-bvi-atlantic-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
            Registration Successful
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
            We've sent a verification link to <strong>{form.email}</strong>.
            Please check your email and click the link to verify your account.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-bvi-atlantic-600 text-white rounded-xl font-semibold hover:bg-bvi-atlantic-500 transition-colors"
            >
              Go to Login
            </button>
            <p className="text-sm text-bvi-granite-400">
              Didn't receive the email?{' '}
              <button
                onClick={() => setStep('form')}
                className="text-bvi-turquoise-600 hover:text-bvi-turquoise-500"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-bvi-atlantic-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-error-600 dark:text-error-400" />
          </div>
          <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
            Registration Failed
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
            {error || 'An error occurred during registration. Please try again.'}
          </p>
          <button
            onClick={() => {
              setStep('form');
              setError(null);
            }}
            className="w-full py-3 bg-bvi-atlantic-600 text-white rounded-xl font-semibold hover:bg-bvi-atlantic-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bvi-atlantic-600 to-bvi-atlantic-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">FOP System</h2>
              <p className="text-sm text-bvi-sand-300">British Virgin Islands</p>
            </div>
          </div>
        </div>
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">
            Streamline Your Aviation Permits
          </h1>
          <p className="text-lg text-bvi-sand-300">
            Register to submit and manage Foreign Operator Permit applications
            for flights to and through the British Virgin Islands.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-bvi-sand-400">
          <span>Secure</span>
          <span>•</span>
          <span>Efficient</span>
          <span>•</span>
          <span>Compliant</span>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-bvi-atlantic-600 dark:text-white">FOP System</span>
          </div>

          <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-2">
            Create an Account
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-bvi-turquoise-600 hover:text-bvi-turquoise-500 font-medium">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  required
                  className="w-full px-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  className="w-full pl-10 pr-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
                Company Name (Optional)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
                <input
                  type="text"
                  value={form.companyName}
                  onChange={handleChange('companyName')}
                  className="w-full pl-10 pr-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                  placeholder="Acme Aviation Inc."
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                id="terms"
                className="mt-1 w-4 h-4 rounded border-bvi-sand-300 text-bvi-turquoise-600 focus:ring-bvi-turquoise-500"
              />
              <label htmlFor="terms" className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">
                I agree to the{' '}
                <Link to="/terms" className="text-bvi-turquoise-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-bvi-turquoise-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
