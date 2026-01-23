import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Portal } from './Portal';

interface CancelSubscriptionModalProps {
  planName: string;
  endDate: string | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function CancelSubscriptionModal({
  planName,
  endDate,
  onConfirm,
  onClose,
}: CancelSubscriptionModalProps) {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'reason' | 'confirm' | 'success'>('reason');

  const reasons = [
    'Too expensive',
    'Not using it enough',
    'Missing features I need',
    'Switching to another solution',
    'Temporary pause - will return',
    'Other',
  ];

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setStep('success');
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'the end of your billing period';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Portal>
      <div className="modal-backdrop" onClick={onClose}>
        {/* Modal */}
        <div
          className="modal-content max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-bvi-sand-200 dark:border-bvi-atlantic-700">
          <h2 className="text-xl font-semibold text-bvi-atlantic-600 dark:text-white">
            {step === 'success' ? 'Subscription Cancelled' : 'Cancel Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-bvi-granite-400 hover:text-bvi-granite-600 dark:hover:text-white rounded-lg hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'reason' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning-700 dark:text-warning-400">
                    Are you sure you want to cancel?
                  </p>
                  <p className="text-sm text-warning-600 dark:text-warning-500 mt-1">
                    You'll lose access to {planName} features at {formatDate(endDate)}.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-3">
                  Help us improve - why are you cancelling?
                </label>
                <div className="space-y-2">
                  {reasons.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        reason === r
                          ? 'border-bvi-turquoise-500 bg-bvi-turquoise-50 dark:bg-bvi-turquoise-900/20'
                          : 'border-bvi-sand-200 dark:border-bvi-atlantic-600 hover:border-bvi-turquoise-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4 text-bvi-turquoise-500 focus:ring-bvi-turquoise-500"
                      />
                      <span className="text-sm text-bvi-granite-600 dark:text-bvi-granite-300">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 text-bvi-granite-600 dark:text-bvi-granite-300 rounded-xl font-semibold hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!reason}
                  className="flex-1 py-3 bg-error-500 text-white rounded-xl font-semibold hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <p className="text-bvi-granite-600 dark:text-bvi-granite-300">
                To confirm cancellation, please type <strong>CANCEL</strong> below:
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Type CANCEL"
                className="w-full px-4 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-white dark:bg-bvi-atlantic-900 text-bvi-atlantic-600 dark:text-white placeholder-bvi-granite-400 focus:ring-2 focus:ring-error-500 focus:border-transparent"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('reason')}
                  className="flex-1 py-3 border border-bvi-sand-200 dark:border-bvi-atlantic-600 text-bvi-granite-600 dark:text-bvi-granite-300 rounded-xl font-semibold hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={confirmText !== 'CANCEL' || loading}
                  className="flex-1 py-3 bg-error-500 text-white rounded-xl font-semibold hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-4 text-center">
              <p className="text-bvi-granite-600 dark:text-bvi-granite-300 mb-4">
                Your subscription has been cancelled. You'll continue to have access to {planName} features until {formatDate(endDate)}.
              </p>
              <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400 mb-6">
                Changed your mind? You can resubscribe anytime.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-bvi-atlantic-600 text-white rounded-xl font-semibold hover:bg-bvi-atlantic-500 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </Portal>
  );
}
