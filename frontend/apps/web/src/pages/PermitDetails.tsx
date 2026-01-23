import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  ArrowLeft,
  Download,
  Building2,
  Plane,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Clock,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { permitsApi } from '@fop/api';
import type { PermitStatus, ApplicationType } from '@fop/types';
import { formatDate, formatMoney } from '../utils/date';
import { useNotificationStore } from '@fop/core';
import { Portal } from '../components/Portal';

// Support both numeric and string enum values from backend
const statusColors: Record<string | number, string> = {
  1: 'bg-success-100 text-success-700',
  2: 'bg-neutral-100 text-neutral-500',
  3: 'bg-error-100 text-error-700',
  4: 'bg-warning-100 text-warning-700',
  Active: 'bg-success-100 text-success-700',
  Expired: 'bg-neutral-100 text-neutral-500',
  Revoked: 'bg-error-100 text-error-700',
  Suspended: 'bg-warning-100 text-warning-700',
};

const statusLabels: Record<string | number, string> = {
  1: 'Active',
  2: 'Expired',
  3: 'Revoked',
  4: 'Suspended',
  Active: 'Active',
  Expired: 'Expired',
  Revoked: 'Revoked',
  Suspended: 'Suspended',
};

const statusIcons: Record<string | number, typeof CheckCircle> = {
  1: CheckCircle,
  2: Clock,
  3: XCircle,
  4: Pause,
  Active: CheckCircle,
  Expired: Clock,
  Revoked: XCircle,
  Suspended: Pause,
};

const typeLabels: Record<string | number, string> = {
  1: 'One-Time Permit',
  2: 'Blanket Permit',
  3: 'Emergency Permit',
  OneTime: 'One-Time Permit',
  Blanket: 'Blanket Permit',
  Emergency: 'Emergency Permit',
};

export function PermitDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationStore();

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showReinstateModal, setShowReinstateModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [suspendUntil, setSuspendUntil] = useState('');
  const [extendDate, setExtendDate] = useState('');
  const [reinstateNotes, setReinstateNotes] = useState('');

  const { data: permit, isLoading, error } = useQuery({
    queryKey: ['permit', id],
    queryFn: () => permitsApi.getById(id!),
    enabled: !!id,
  });

  // Suspend mutation
  const suspendMutation = useMutation({
    mutationFn: ({ reason, until }: { reason: string; until?: string }) =>
      permitsApi.suspend(id!, reason, until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permit', id] });
      queryClient.invalidateQueries({ queryKey: ['permits'] });
      setShowSuspendModal(false);
      setActionReason('');
      setSuspendUntil('');
      success('Permit Suspended', 'The permit has been suspended.');
    },
    onError: () => {
      showError('Error', 'Failed to suspend permit.');
    },
  });

  // Revoke mutation
  const revokeMutation = useMutation({
    mutationFn: (reason: string) => permitsApi.revoke(id!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permit', id] });
      queryClient.invalidateQueries({ queryKey: ['permits'] });
      setShowRevokeModal(false);
      setActionReason('');
      success('Permit Revoked', 'The permit has been permanently revoked.');
    },
    onError: () => {
      showError('Error', 'Failed to revoke permit.');
    },
  });

  // Reinstate mutation
  const reinstateMutation = useMutation({
    mutationFn: (notes?: string) => permitsApi.reinstate(id!, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permit', id] });
      queryClient.invalidateQueries({ queryKey: ['permits'] });
      setShowReinstateModal(false);
      setReinstateNotes('');
      success('Permit Reinstated', 'The permit has been reinstated.');
    },
    onError: () => {
      showError('Error', 'Failed to reinstate permit.');
    },
  });

  // Extend mutation
  const extendMutation = useMutation({
    mutationFn: ({ newEndDate, reason }: { newEndDate: string; reason: string }) =>
      permitsApi.extend(id!, newEndDate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permit', id] });
      queryClient.invalidateQueries({ queryKey: ['permits'] });
      setShowExtendModal(false);
      setExtendDate('');
      setActionReason('');
      success('Permit Extended', 'The permit validity has been extended.');
    },
    onError: () => {
      showError('Error', 'Failed to extend permit.');
    },
  });

  const handleDownload = async () => {
    try {
      const blob = await permitsApi.downloadDocument(id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permit-${permit?.permitNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      showError('Download Failed', 'Failed to download permit document.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="card p-6">
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="space-y-6">
        <Link to="/permits" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
          <ArrowLeft className="w-4 h-4" />
          Back to Permits
        </Link>
        <div className="card p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-error-500" />
          <h2 className="text-xl font-semibold text-neutral-900">Permit Not Found</h2>
          <p className="text-neutral-500 mt-1">
            The permit you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[permit.status] || CheckCircle;
  const isActive = permit.status === 1 || permit.status === 'Active';
  const isSuspended = permit.status === 4 || permit.status === 'Suspended';
  const isExpired = permit.status === 2 || permit.status === 'Expired';
  const isRevoked = permit.status === 3 || permit.status === 'Revoked';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/permits"
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{permit.permitNumber}</h1>
              <span className={`badge ${statusColors[permit.status]}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusLabels[permit.status]}
              </span>
            </div>
            <p className="text-neutral-500 mt-1">{typeLabels[permit.type]}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>

          {isActive && (
            <>
              <button
                onClick={() => setShowExtendModal(true)}
                className="btn-secondary"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Extend
              </button>
              <button
                onClick={() => setShowSuspendModal(true)}
                className="btn-secondary text-warning-600 hover:bg-warning-50"
              >
                <Pause className="w-4 h-4 mr-2" />
                Suspend
              </button>
              <button
                onClick={() => setShowRevokeModal(true)}
                className="btn-secondary text-error-600 hover:bg-error-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Revoke
              </button>
            </>
          )}

          {isSuspended && (
            <>
              <button
                onClick={() => setShowReinstateModal(true)}
                className="btn-primary bg-success-600 hover:bg-success-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Reinstate
              </button>
              <button
                onClick={() => setShowRevokeModal(true)}
                className="btn-secondary text-error-600 hover:bg-error-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Revoke
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {isExpired && (
        <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-neutral-500 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-700">Permit Expired</p>
              <p className="text-sm text-neutral-500">
                This permit expired on {formatDate(permit.validUntil)}. The operator must submit a new application for renewal.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Pause className="w-5 h-5 text-warning-600 mt-0.5" />
            <div>
              <p className="font-medium text-warning-800">Permit Suspended</p>
              <p className="text-sm text-warning-600">
                This permit is currently suspended. Operations under this permit are not authorized.
              </p>
            </div>
          </div>
        </div>
      )}

      {isRevoked && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-error-600 mt-0.5" />
            <div>
              <p className="font-medium text-error-800">Permit Revoked</p>
              <p className="text-sm text-error-600">
                This permit has been permanently revoked and cannot be reinstated.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Details */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Permit Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-neutral-500">Permit Number</dt>
                <dd className="font-medium text-neutral-900">{permit.permitNumber}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Permit Type</dt>
                <dd className="font-medium text-neutral-900">{typeLabels[permit.type]}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Valid From</dt>
                <dd className="font-medium text-neutral-900">
                  {formatDate(permit.validFrom)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Valid Until</dt>
                <dd className="font-medium text-neutral-900">
                  {formatDate(permit.validUntil)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Issued On</dt>
                <dd className="font-medium text-neutral-900">{formatDate(permit.issuedAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Issued By</dt>
                <dd className="font-medium text-neutral-900">{permit.issuedBy}</dd>
              </div>
            </dl>
          </div>

          {/* Operator Info */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900">Operator</h2>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <dt className="text-sm text-neutral-500">Operator Name</dt>
                <dd className="font-medium text-neutral-900">{permit.operatorName}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Operator ID</dt>
                <dd className="font-mono text-sm text-neutral-600">{permit.operatorId}</dd>
              </div>
            </dl>
          </div>

          {/* Aircraft Info */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Plane className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900">Aircraft</h2>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-neutral-500">Registration</dt>
                <dd className="font-medium text-neutral-900">{permit.aircraftRegistration}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Aircraft ID</dt>
                <dd className="font-mono text-sm text-neutral-600">{permit.aircraftId}</dd>
              </div>
            </dl>
          </div>

          {/* Conditions */}
          {permit.conditions && permit.conditions.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Conditions</h2>
              <ul className="space-y-2">
                {permit.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span className="text-neutral-700">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fees Paid */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900">Fees Paid</h2>
            </div>
            <p className="text-3xl font-bold text-neutral-900">
              {formatMoney(permit.feesPaid.amount, permit.feesPaid.currency)}
            </p>
          </div>

          {/* Quick Links */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Related</h2>
            <div className="space-y-2">
              <Link
                to={`/applications/${permit.applicationId}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900">Application</p>
                    <p className="text-sm text-neutral-500">{permit.applicationNumber}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </Link>
            </div>
          </div>

          {/* Verification */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Verification</h2>
            <p className="text-sm text-neutral-500 mb-3">
              Third parties can verify this permit using the permit number.
            </p>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Permit Number</p>
              <p className="font-mono text-lg font-semibold text-neutral-900">
                {permit.permitNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Suspend Permit</h2>
              <p className="text-neutral-500 mt-1">Temporarily suspend {permit.permitNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-warning-700 text-sm">
                  Suspending this permit will prevent the operator from conducting flights under this permit until it is reinstated.
                </p>
              </div>

              <div>
                <label htmlFor="suspendReason" className="label">
                  Reason for Suspension <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="suspendReason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Provide reason for suspension..."
                />
              </div>

              <div>
                <label htmlFor="suspendUntil" className="label">
                  Suspend Until (Optional)
                </label>
                <input
                  id="suspendUntil"
                  type="date"
                  value={suspendUntil}
                  onChange={(e) => setSuspendUntil(e.target.value)}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Leave empty for indefinite suspension
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuspendModal(false);
                  setActionReason('');
                  setSuspendUntil('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  suspendMutation.mutate({
                    reason: actionReason,
                    until: suspendUntil || undefined,
                  })
                }
                disabled={suspendMutation.isPending || !actionReason.trim()}
                className="btn-primary bg-warning-600 hover:bg-warning-700"
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Suspend Permit'}
              </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Revoke Permit</h2>
              <p className="text-neutral-500 mt-1">Permanently revoke {permit.permitNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-error-700 text-sm font-medium">Warning: This action cannot be undone</p>
                <p className="text-error-600 text-sm mt-1">
                  Revoking this permit will permanently invalidate it. The operator will need to submit a new application.
                </p>
              </div>

              <div>
                <label htmlFor="revokeReason" className="label">
                  Reason for Revocation <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="revokeReason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Provide reason for revocation..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRevokeModal(false);
                  setActionReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => revokeMutation.mutate(actionReason)}
                disabled={revokeMutation.isPending || !actionReason.trim()}
                className="btn-primary bg-error-600 hover:bg-error-700"
              >
                {revokeMutation.isPending ? 'Revoking...' : 'Revoke Permit'}
              </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Reinstate Modal */}
      {showReinstateModal && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Reinstate Permit</h2>
              <p className="text-neutral-500 mt-1">Reinstate {permit.permitNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-success-700 text-sm">
                  Reinstating this permit will restore the operator's authorization to conduct flights.
                </p>
              </div>

              <div>
                <label htmlFor="reinstateNotes" className="label">
                  Notes (Optional)
                </label>
                <textarea
                  id="reinstateNotes"
                  value={reinstateNotes}
                  onChange={(e) => setReinstateNotes(e.target.value)}
                  rows={2}
                  className="input"
                  placeholder="Add any notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReinstateModal(false);
                  setReinstateNotes('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => reinstateMutation.mutate(reinstateNotes || undefined)}
                disabled={reinstateMutation.isPending}
                className="btn-primary bg-success-600 hover:bg-success-700"
              >
                {reinstateMutation.isPending ? 'Reinstating...' : 'Reinstate Permit'}
              </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Extend Modal */}
      {showExtendModal && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Extend Permit</h2>
              <p className="text-neutral-500 mt-1">Extend validity of {permit.permitNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  Current validity: {formatDate(permit.validFrom)} to{' '}
                  {formatDate(permit.validUntil)}
                </p>
              </div>

              <div>
                <label htmlFor="extendDate" className="label">
                  New End Date <span className="text-error-500">*</span>
                </label>
                <input
                  id="extendDate"
                  type="date"
                  value={extendDate}
                  onChange={(e) => setExtendDate(e.target.value)}
                  className="input"
                  min={permit.validUntil}
                />
              </div>

              <div>
                <label htmlFor="extendReason" className="label">
                  Reason for Extension <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="extendReason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={2}
                  className="input"
                  placeholder="Provide reason for extension..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowExtendModal(false);
                  setExtendDate('');
                  setActionReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  extendMutation.mutate({
                    newEndDate: extendDate,
                    reason: actionReason,
                  })
                }
                disabled={extendMutation.isPending || !extendDate || !actionReason.trim()}
                className="btn-primary"
              >
                {extendMutation.isPending ? 'Extending...' : 'Extend Permit'}
              </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
