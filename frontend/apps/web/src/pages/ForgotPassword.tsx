import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Plane, CheckCircle } from 'lucide-react';
import { apiClient } from '@fop/api';

type Status = 'form' | 'success';

export function ForgotPassword() {
  const [status, setStatus] = useState<Status>('form');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch {
      // Always show success to prevent email enumeration
      setStatus('success');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-bvi-atlantic-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-bvi-atlantic-600 dark:text-white">FOP System</span>
          </div>

          <div className="w-16 h-16 mx-auto mb-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
            Check Your Email
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
            If an account exists with <strong>{email}</strong>, we've sent a password reset link.
            Please check your email and follow the instructions.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 bg-bvi-atlantic-600 text-white rounded-xl font-semibold hover:bg-bvi-atlantic-500 transition-colors"
            >
              Return to Login
            </Link>
            <button
              onClick={() => {
                setStatus('form');
                setEmail('');
              }}
              className="w-full py-3 text-bvi-granite-500 dark:text-bvi-granite-400 font-medium hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-bvi-atlantic-800 rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-bvi-atlantic-600 dark:text-white">FOP System</span>
        </div>

        <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-2 text-center">
          Forgot Password?
        </h1>
        <p className="text-bvi-granite-500 dark:text-bvi-granite-400 text-center mb-8">
          No worries! Enter your email and we'll send you reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 mt-6 text-bvi-granite-500 dark:text-bvi-granite-400 font-medium hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
