import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Building2,
  Percent,
  ChevronRight,
} from 'lucide-react';
import { waiversApi, WAIVER_TYPES } from '@fop/api';
import type { PendingWaiver, WaiverType } from '@fop/types';
import { formatDate, formatMoney, formatDistanceToNow } from '../utils/date';
import { useNotificationStore } from '@fop/core';

const waiverTypeColors: Record<WaiverType, string> = {
  Emergency: 'bg-error-100 text-error-700',
  Humanitarian: 'bg-blue-100 text-blue-700',
  Government: 'bg-purple-100 text-purple-700',
  Diplomatic: 'bg-yellow-100 text-yellow-700',
  Military: 'bg-neutral-100 text-neutral-700',
  Other: 'bg-neutral-100 text-neutral-600',
};

export function Waivers() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationStore();
  const [selectedWaiver, setSelectedWaiver] = useState<PendingWaiver | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [waiverPercentage, setWaiverPercentage] = useState(100);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending waivers
  const { data: pendingWaivers, isLoading, error } = useQuery({
    queryKey: ['pendingWaivers'],
    queryFn: () => waiversApi.getPending(),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ waiverId, applicationId, percentage }: { waiverId: string; applicationId: string; percentage: number }) =>
      waiversApi.approve(waiverId, {
        applicationId,
        approvedBy: 'Current User', // Would come from auth context
        waiverPercentage: percentage,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pendingWaivers'] });
      queryClient.invalidateQueries({ queryKey: ['financeDashboard'] });
      setShowApproveModal(false);
      setSelectedWaiver(null);
      setWaiverPercentage(100);
      success(
        'Waiver Approved',
        `Fee reduced by ${formatMoney(result.waivedAmount.amount, result.waivedAmount.currency)}. New total: ${formatMoney(result.newTotalFee.amount, result.newTotalFee.currency)}`
      );
    },
    onError: () => {
      showError('Error', 'Failed to approve waiver.');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ waiverId, applicationId, reason }: { waiverId: string; applicationId: string; reason: string }) =>
      waiversApi.reject(waiverId, {
        applicationId,
        rejectedBy: 'Current User', // Would come from auth context
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingWaivers'] });
      queryClient.invalidateQueries({ queryKey: ['financeDashboard'] });
      setShowRejectModal(false);
      setSelectedWaiver(null);
      setRejectionReason('');
      success('Waiver Rejected', 'The fee waiver request has been rejected.');
    },
    onError: () => {
      showError('Error', 'Failed to reject waiver.');
    },
  });

  const openApproveModal = (waiver: PendingWaiver) => {
    setSelectedWaiver(waiver);
    setWaiverPercentage(100);
    setShowApproveModal(true);
  };

  const openRejectModal = (waiver: PendingWaiver) => {
    setSelectedWaiver(waiver);
    setShowRejectModal(true);
  };

  const getWaiverTypeLabel = (type: WaiverType) => {
    return WAIVER_TYPES.find((t) => t.value === type)?.label || type;
  };

  const calculateWaivedAmount = (currentFee: number, percentage: number) => {
    return (currentFee * percentage) / 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Fee Waivers</h1>
        <p className="text-neutral-500 mt-1">Review and process fee waiver requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {pendingWaivers?.length ?? '-'}
              </p>
              <p className="text-sm text-neutral-500">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-error-100">
              <AlertTriangle className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {pendingWaivers?.filter((w) => w.waiverType === 'Emergency').length ?? '-'}
              </p>
              <p className="text-sm text-neutral-500">Emergency Requests</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {pendingWaivers
                  ? formatMoney(
                      pendingWaivers.reduce((sum, w) => sum + w.currentFeeAmount, 0),
                      pendingWaivers[0]?.currency || 'USD'
                    )
                  : '-'}
              </p>
              <p className="text-sm text-neutral-500">Total Value Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-error-50 border-error-200">
          <p className="text-error-700">Failed to load waiver requests. Please try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-neutral-500 mt-2">Loading waiver requests...</p>
        </div>
      )}

      {/* Waivers List */}
      {!isLoading && !error && (
        <>
          {!pendingWaivers?.length ? (
            <div className="card p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-500" />
              <h3 className="text-lg font-medium text-neutral-900">No pending waivers</h3>
              <p className="text-neutral-500 mt-1">
                All waiver requests have been processed. Check back later for new requests.
              </p>
            </div>
          ) : (
            <div className="card divide-y divide-neutral-200">
              {pendingWaivers.map((waiver) => (
                <div
                  key={waiver.waiverId}
                  className="p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          to={`/applications/${waiver.applicationId}`}
                          className="font-medium text-neutral-900 hover:text-primary-600"
                        >
                          {waiver.applicationNumber}
                        </Link>
                        <span className={`badge ${waiverTypeColors[waiver.waiverType as WaiverType]}`}>
                          {getWaiverTypeLabel(waiver.waiverType as WaiverType)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {waiver.operatorName}
                        </div>
                        <span>Requested {formatDistanceToNow(waiver.requestedAt)}</span>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg">
                        <p className="text-sm text-neutral-500 mb-1">Reason for Waiver</p>
                        <p className="text-neutral-700">{waiver.reason}</p>
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <p className="text-xs text-neutral-500">Current Fee</p>
                          <p className="font-semibold text-neutral-900">
                            {formatMoney(waiver.currentFeeAmount, waiver.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Requested By</p>
                          <p className="text-neutral-700">{waiver.requestedBy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <button
                        onClick={() => openApproveModal(waiver)}
                        className="btn-primary text-sm py-1.5 px-4 bg-success-600 hover:bg-success-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(waiver)}
                        className="btn-secondary text-sm py-1.5 px-4 text-error-600 hover:bg-error-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <Link
                        to={`/applications/${waiver.applicationId}`}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        View Application
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedWaiver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Approve Fee Waiver</h2>
              <p className="text-neutral-500 mt-1">
                {selectedWaiver.applicationNumber} - {selectedWaiver.operatorName}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Waiver Type</dt>
                    <dd className="font-medium">
                      <span className={`badge ${waiverTypeColors[selectedWaiver.waiverType as WaiverType]}`}>
                        {getWaiverTypeLabel(selectedWaiver.waiverType as WaiverType)}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Current Fee</dt>
                    <dd className="font-semibold text-neutral-900">
                      {formatMoney(selectedWaiver.currentFeeAmount, selectedWaiver.currency)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Reason:</strong> {selectedWaiver.reason}
                </p>
              </div>

              <div>
                <label htmlFor="waiverPercentage" className="label">
                  Waiver Percentage <span className="text-error-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="waiverPercentage"
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={waiverPercentage}
                    onChange={(e) => setWaiverPercentage(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 text-lg font-semibold text-neutral-900 w-20">
                    <Percent className="w-5 h-5" />
                    {waiverPercentage}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-neutral-500 mt-2">
                  <span>Partial (10%)</span>
                  <span>Full (100%)</span>
                </div>
              </div>

              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-success-600">Amount Waived</dt>
                    <dd className="font-semibold text-success-700">
                      {formatMoney(
                        calculateWaivedAmount(selectedWaiver.currentFeeAmount, waiverPercentage),
                        selectedWaiver.currency
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-success-600">New Fee Amount</dt>
                    <dd className="font-semibold text-success-700">
                      {formatMoney(
                        selectedWaiver.currentFeeAmount -
                          calculateWaivedAmount(selectedWaiver.currentFeeAmount, waiverPercentage),
                        selectedWaiver.currency
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedWaiver(null);
                  setWaiverPercentage(100);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  approveMutation.mutate({
                    waiverId: selectedWaiver.waiverId,
                    applicationId: selectedWaiver.applicationId,
                    percentage: waiverPercentage,
                  })
                }
                disabled={approveMutation.isPending}
                className="btn-primary bg-success-600 hover:bg-success-700"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve Waiver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedWaiver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Reject Fee Waiver</h2>
              <p className="text-neutral-500 mt-1">
                {selectedWaiver.applicationNumber} - {selectedWaiver.operatorName}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-error-700 text-sm">
                  The applicant will be notified that their waiver request has been rejected and
                  they must pay the full fee amount.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Original Reason for Waiver</p>
                <p className="text-neutral-700">{selectedWaiver.reason}</p>
              </div>

              <div>
                <label htmlFor="rejectionReason" className="label">
                  Rejection Reason <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Explain why this waiver request cannot be approved..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedWaiver(null);
                  setRejectionReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  rejectMutation.mutate({
                    waiverId: selectedWaiver.waiverId,
                    applicationId: selectedWaiver.applicationId,
                    reason: rejectionReason,
                  })
                }
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="btn-primary bg-error-600 hover:bg-error-700"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Waiver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
