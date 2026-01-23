import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Plane, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@fop/api';

type Status = 'form' | 'success' | 'error' | 'invalid';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('form');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setStatus('invalid');
    }
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        email,
        token,
      });

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-bvi-atlantic-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-bvi-atlantic-600 dark:text-white">FOP System</span>
          </div>

          <div className="w-16 h-16 mx-auto mb-6 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-error-600 dark:text-error-400" />
          </div>
          <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full py-3 bg-bvi-atlantic-600 text-white rounded-xl font-semibold hover:bg-bvi-atlantic-500 transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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
            Password Reset Successful
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
            Your password has been reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-bvi-atlantic-600 text-white rounded-xl font-semibold hover:bg-bvi-atlantic-500 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-bvi-atlantic-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-bvi-atlantic-600 dark:text-white">FOP System</span>
          </div>

          <div className="w-16 h-16 mx-auto mb-6 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-error-600 dark:text-error-400" />
          </div>
          <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
            Reset Failed
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
            {error || 'The reset link is invalid or has expired.'}
          </p>
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors"
            >
              Request New Link
            </Link>
            <button
              onClick={() => {
                setStatus('form');
                setError(null);
              }}
              className="w-full py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 text-bvi-granite-600 dark:text-bvi-granite-300 rounded-xl font-semibold hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors"
            >
              Try Again
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
          Reset Your Password
        </h1>
        <p className="text-bvi-granite-500 dark:text-bvi-granite-400 text-center mb-8">
          Enter your new password below.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl text-error-700 dark:text-error-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-12 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bvi-granite-400 hover:text-bvi-granite-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-xl bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white focus:ring-2 focus:ring-bvi-turquoise-500 focus:border-transparent"
                placeholder="Confirm new password"
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
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
