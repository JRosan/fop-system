import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, Plane } from 'lucide-react';
import { apiClient } from '@fop/api';

type Status = 'verifying' | 'success' | 'error';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setError('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail();
  }, [email, token]);

  const verifyEmail = async () => {
    try {
      await apiClient.post('/auth/verify-email', {
        email,
        token,
      });

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Verification failed.';
      setError(errorMessage);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      await apiClient.post('/auth/resend-verification', { email });
      alert('A new verification email has been sent.');
    } catch {
      alert('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-bvi-atlantic-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-bvi-atlantic-600 dark:text-white">FOP System</span>
        </div>

        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-bvi-turquoise-100 dark:bg-bvi-turquoise-900/30 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-bvi-turquoise-600 dark:text-bvi-turquoise-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
              Verifying Your Email
            </h1>
            <p className="text-bvi-granite-500 dark:text-bvi-granite-400">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
            </div>
            <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
              Email Verified
            </h1>
            <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-bvi-atlantic-600 text-white rounded-xl font-semibold hover:bg-bvi-atlantic-500 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-error-600 dark:text-error-400" />
            </div>
            <h1 className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white mb-4">
              Verification Failed
            </h1>
            <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
              {error || 'The verification link is invalid or has expired.'}
            </p>
            <div className="space-y-3">
              {email && (
                <button
                  onClick={handleResendVerification}
                  className="w-full py-3 bg-bvi-turquoise-500 text-white rounded-xl font-semibold hover:bg-bvi-turquoise-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Resend Verification Email
                </button>
              )}
              <Link
                to="/register"
                className="block w-full py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 text-bvi-granite-600 dark:text-bvi-granite-300 rounded-xl font-semibold hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors"
              >
                Back to Registration
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
