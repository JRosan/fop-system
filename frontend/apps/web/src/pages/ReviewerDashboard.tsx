import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardCheck,
  Clock,
  FileSearch,
  CheckCircle,
  XCircle,
  Play,
  AlertTriangle,
  FileText,
  ChevronRight,
  Eye,
  Download,
} from 'lucide-react';
import { applicationsApi, documentsApi, dashboardApi } from '@fop/api';
import type { ApplicationSummary, ApplicationStatus, FopApplication, Document } from '@fop/types';
import { formatDate, formatDistanceToNow } from '../utils/date';
import { useNotificationStore } from '@fop/core';
import { Portal } from '../components/Portal';

// Support both numeric and string enum values from backend (camelCase and PascalCase)
const statusColors: Record<string | number, string> = {
  1: 'bg-neutral-100 text-neutral-600 dark:bg-bvi-granite-700 dark:text-bvi-granite-300',
  2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  4: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  5: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  6: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  7: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
  8: 'bg-neutral-100 text-neutral-500 dark:bg-bvi-granite-700 dark:text-bvi-granite-400',
  9: 'bg-neutral-100 text-neutral-500 dark:bg-bvi-granite-700 dark:text-bvi-granite-400',
  // camelCase (response data)
  draft: 'bg-neutral-100 text-neutral-600 dark:bg-bvi-granite-700 dark:text-bvi-granite-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  underReview: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  pendingDocuments: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  pendingPayment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  approved: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  rejected: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
  expired: 'bg-neutral-100 text-neutral-500 dark:bg-bvi-granite-700 dark:text-bvi-granite-400',
  cancelled: 'bg-neutral-100 text-neutral-500 dark:bg-bvi-granite-700 dark:text-bvi-granite-400',
  // PascalCase (filter values)
  Draft: 'bg-neutral-100 text-neutral-600 dark:bg-bvi-granite-700 dark:text-bvi-granite-300',
  Submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  UnderReview: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  PendingDocuments: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  PendingPayment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Approved: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  Rejected: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
  Expired: 'bg-neutral-100 text-neutral-500 dark:bg-bvi-granite-700 dark:text-bvi-granite-400',
  Cancelled: 'bg-neutral-100 text-neutral-500 dark:bg-bvi-granite-700 dark:text-bvi-granite-400',
};

const statusLabels: Record<string | number, string> = {
  1: 'Draft',
  2: 'Submitted',
  3: 'Under Review',
  4: 'Pending Documents',
  5: 'Pending Payment',
  6: 'Approved',
  7: 'Rejected',
  8: 'Expired',
  9: 'Cancelled',
  // camelCase (response data)
  draft: 'Draft',
  submitted: 'Submitted',
  underReview: 'Under Review',
  pendingDocuments: 'Pending Documents',
  pendingPayment: 'Pending Payment',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
  // PascalCase (filter values)
  Draft: 'Draft',
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  PendingDocuments: 'Pending Documents',
  PendingPayment: 'Pending Payment',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Expired: 'Expired',
  Cancelled: 'Cancelled',
};

const typeLabels: Record<string | number, string> = {
  1: 'One-Time',
  2: 'Blanket',
  3: 'Emergency',
  OneTime: 'One-Time',
  Blanket: 'Blanket',
  Emergency: 'Emergency',
};

const documentTypeLabels: Record<string, string> = {
  CERTIFICATE_OF_AIRWORTHINESS: 'Certificate of Airworthiness',
  CERTIFICATE_OF_REGISTRATION: 'Certificate of Registration',
  AIR_OPERATOR_CERTIFICATE: 'Air Operator Certificate',
  INSURANCE_CERTIFICATE: 'Insurance Certificate',
  NOISE_CERTIFICATE: 'Noise Certificate',
  CREW_LICENSE: 'Crew License',
  FLIGHT_PLAN: 'Flight Plan',
  OTHER: 'Other Document',
};

export function ReviewerDashboard() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationStore();
  const [selectedApplication, setSelectedApplication] = useState<FopApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [documentRejectionReason, setDocumentRejectionReason] = useState('');
  // Using PascalCase string values for API query parameters
  const [statusFilter, setStatusFilter] = useState<string[]>([
    'Submitted',
    'UnderReview',
    'PendingPayment',
    'PendingDocuments',
  ]);

  // Fetch reviewer dashboard stats
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['reviewerDashboard'],
    queryFn: () => dashboardApi.getReviewerDashboard(),
  });

  // Fetch applications for review
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications', 'review', { statuses: statusFilter }],
    queryFn: () =>
      applicationsApi.getAll({
        statuses: statusFilter,
        pageSize: 50,
      }),
  });

  // Start review mutation
  const startReviewMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.startReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerDashboard'] });
      success('Review Started', 'Application is now under review.');
    },
    onError: () => {
      showError('Error', 'Failed to start review.');
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      applicationsApi.approve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerDashboard'] });
      setShowApproveModal(false);
      setSelectedApplication(null);
      setApprovalNotes('');
      success('Application Approved', 'The application has been approved and a permit will be issued.');
    },
    onError: () => {
      showError('Error', 'Failed to approve application.');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      applicationsApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerDashboard'] });
      setShowRejectModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      success('Application Rejected', 'The application has been rejected.');
    },
    onError: () => {
      showError('Error', 'Failed to reject application.');
    },
  });

  // Verify document mutation
  const verifyDocumentMutation = useMutation({
    mutationFn: ({ documentId, verified, rejectionReason }: { documentId: string; verified: boolean; rejectionReason?: string }) =>
      documentsApi.verify(documentId, { documentId, verified, rejectionReason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerDashboard'] });
      setShowDocumentModal(false);
      setSelectedDocument(null);
      setDocumentRejectionReason('');
      success(
        variables.verified ? 'Document Verified' : 'Document Rejected',
        variables.verified
          ? 'The document has been verified.'
          : 'The document has been rejected.'
      );
    },
    onError: () => {
      showError('Error', 'Failed to verify document.');
    },
  });

  const handleStartReview = (application: ApplicationSummary) => {
    startReviewMutation.mutate(application.id);
  };

  const openApproveModal = async (application: ApplicationSummary) => {
    const fullApp = await applicationsApi.getById(application.id);
    setSelectedApplication(fullApp);
    setShowApproveModal(true);
  };

  const openRejectModal = async (application: ApplicationSummary) => {
    const fullApp = await applicationsApi.getById(application.id);
    setSelectedApplication(fullApp);
    setShowRejectModal(true);
  };

  const openDocumentModal = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const blob = await documentsApi.download(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch {
      showError('Download Failed', 'Failed to download document.');
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const isLoading = dashboardLoading || applicationsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reviewer Dashboard</h1>
        <p className="text-neutral-500 dark:text-bvi-granite-400 mt-1">Review and process permit applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {dashboardData?.pendingReview ?? '-'}
              </p>
              <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {dashboardData?.underReview ?? '-'}
              </p>
              <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">Under Review</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <FileSearch className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {dashboardData?.pendingDocuments ?? '-'}
              </p>
              <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">Pending Documents</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {dashboardData?.completedToday ?? '-'}
              </p>
              <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">Completed Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-700 dark:text-bvi-granite-300">Filter by status:</span>
          <div className="flex flex-wrap gap-2">
            {(['Submitted', 'UnderReview', 'PendingPayment', 'PendingDocuments'] as string[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status as ApplicationStatus)}
                  className={`badge cursor-pointer transition-colors ${
                    statusFilter.includes(status)
                      ? statusColors[status]
                      : 'bg-neutral-100 text-neutral-400 dark:bg-bvi-granite-700 dark:text-bvi-granite-500'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="card">
        <div className="p-4 border-b border-neutral-200 dark:border-bvi-granite-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Applications for Review</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-bvi-turquoise-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-neutral-500 dark:text-bvi-granite-400 mt-2">Loading applications...</p>
          </div>
        ) : !applicationsData?.items.length ? (
          <div className="p-8 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-neutral-400 dark:text-bvi-granite-500" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No applications to review</h3>
            <p className="text-neutral-500 dark:text-bvi-granite-400 mt-1">
              All caught up! Check back later for new submissions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-bvi-granite-700">
            {applicationsData.items.map((application) => (
              <div
                key={application.id}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-bvi-atlantic-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        to={`/applications/${application.id}`}
                        className="font-medium text-neutral-900 dark:text-white hover:text-bvi-atlantic-600 dark:hover:text-bvi-turquoise-400"
                      >
                        {application.applicationNumber}
                      </Link>
                      <span className={`badge ${statusColors[application.status]}`}>
                        {statusLabels[application.status]}
                      </span>
                      <span className="badge bg-neutral-100 text-neutral-600 dark:bg-bvi-granite-700 dark:text-bvi-granite-300">
                        {typeLabels[application.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-bvi-granite-400">
                      <span>{application.operatorName}</span>
                      <span>{application.aircraftRegistration}</span>
                      {application.submittedAt && (
                        <span>
                          Submitted {formatDistanceToNow(application.submittedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {(application.status === 2 || application.status === 'submitted') && (
                      <button
                        onClick={() => handleStartReview(application)}
                        disabled={startReviewMutation.isPending}
                        className="btn-secondary text-sm py-1.5 px-3"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Review
                      </button>
                    )}

                    {(application.status === 5 || application.status === 'pendingPayment') && (
                      <button
                        onClick={() => openApproveModal(application)}
                        className="btn-primary text-sm py-1.5 px-3 bg-success-600 hover:bg-success-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                    )}

                    {(application.status === 3 || application.status === 'underReview' || application.status === 5 || application.status === 'pendingPayment') && (
                      <button
                        onClick={() => openRejectModal(application)}
                        className="btn-secondary text-sm py-1.5 px-3 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    )}

                    {(application.status === 4 || application.status === 'pendingDocuments') && (
                      <span className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        Awaiting Documents
                      </span>
                    )}

                    <Link
                      to={`/applications/${application.id}`}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-bvi-atlantic-800"
                      title="View Details"
                    >
                      <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-bvi-granite-500" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Assigned Applications */}
      {dashboardData?.assignedApplications && dashboardData.assignedApplications.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-neutral-200 dark:border-bvi-granite-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Assigned Applications</h2>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-bvi-granite-700">
            {dashboardData.assignedApplications.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-bvi-atlantic-800 transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{app.applicationNumber}</p>
                  <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">{app.operatorName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statusColors[app.status as ApplicationStatus]}`}>
                    {statusLabels[app.status as ApplicationStatus]}
                  </span>
                  <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-bvi-granite-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedApplication && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Approve Application</h2>
              <p className="text-neutral-500 mt-1">
                Approve {selectedApplication.applicationNumber}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Payment Status Check */}
              {(!selectedApplication.payment || selectedApplication.payment.status !== 'completed') ? (
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                  <p className="text-error-700 text-sm font-medium">
                    Payment Required
                  </p>
                  <p className="text-error-600 text-sm mt-1">
                    {!selectedApplication.payment
                      ? 'No payment has been requested for this application. Please request payment first.'
                      : `Payment status is "${selectedApplication.payment.status}". Payment must be completed before approval.`
                    }
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                  <p className="text-success-700 text-sm">
                    Approving this application will issue a Foreign Operator Permit to{' '}
                    <strong>{selectedApplication.operator.name}</strong> for aircraft{' '}
                    <strong>{selectedApplication.aircraft.registrationMark}</strong>.
                  </p>
                </div>
              )}

              {/* Payment Summary */}
              {selectedApplication.payment && (
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <label className="label mb-2">Payment</label>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {selectedApplication.calculatedFee.currency} {selectedApplication.calculatedFee.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Method: {selectedApplication.payment.method}
                      </p>
                    </div>
                    <span className={`badge text-xs ${
                      selectedApplication.payment.status === 'completed'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedApplication.payment.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Document Summary */}
              <div>
                <label className="label">Documents ({selectedApplication.documents.length})</label>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {documentTypeLabels[doc.type] || doc.type}
                          </p>
                          <p className="text-xs text-neutral-500">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge text-xs ${
                            doc.status === 'VERIFIED'
                              ? 'bg-success-100 text-success-700'
                              : doc.status === 'REJECTED'
                              ? 'bg-error-100 text-error-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {doc.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => openDocumentModal(doc)}
                          className="p-1 hover:bg-neutral-200 rounded"
                          title="Review Document"
                        >
                          <Eye className="w-4 h-4 text-neutral-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1 hover:bg-neutral-200 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-neutral-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="approvalNotes" className="label">
                  Approval Notes (Optional)
                </label>
                <textarea
                  id="approvalNotes"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Add any notes for this approval..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedApplication(null);
                  setApprovalNotes('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  approveMutation.mutate({
                    id: selectedApplication.id,
                    notes: approvalNotes || undefined,
                  })
                }
                disabled={approveMutation.isPending || !selectedApplication.payment || selectedApplication.payment.status !== 'completed'}
                className="btn-primary bg-success-600 hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve Application'}
              </button>
            </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApplication && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal-content">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Reject Application</h2>
              <p className="text-neutral-500 mt-1">
                Reject {selectedApplication.applicationNumber}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-error-700 text-sm">
                  This action will reject the application. The applicant will be notified of the
                  rejection and the reason provided.
                </p>
              </div>

              <div>
                <label htmlFor="rejectionReason" className="label">
                  Rejection Reason <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Provide a clear reason for rejection..."
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  This reason will be visible to the applicant.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedApplication(null);
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
                    id: selectedApplication.id,
                    reason: rejectionReason,
                  })
                }
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="btn-primary bg-error-600 hover:bg-error-700"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Document Review Modal */}
      {showDocumentModal && selectedDocument && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal-content">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Review Document</h2>
              <p className="text-neutral-500 mt-1">
                {documentTypeLabels[selectedDocument.type] || selectedDocument.type}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">File Name</dt>
                    <dd className="font-medium text-neutral-900">{selectedDocument.fileName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Status</dt>
                    <dd>
                      <span
                        className={`badge text-xs ${
                          selectedDocument.status === 'VERIFIED'
                            ? 'bg-success-100 text-success-700'
                            : selectedDocument.status === 'REJECTED'
                            ? 'bg-error-100 text-error-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {selectedDocument.status}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Uploaded</dt>
                    <dd className="font-medium text-neutral-900">
                      {formatDate(selectedDocument.uploadedAt)}
                    </dd>
                  </div>
                  {selectedDocument.expiryDate && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Expiry Date</dt>
                      <dd className="font-medium text-neutral-900">
                        {formatDate(selectedDocument.expiryDate)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadDocument(selectedDocument)}
                className="btn-secondary w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Document
              </button>

              {selectedDocument.status === 'PENDING' && (
                <div>
                  <label htmlFor="docRejectionReason" className="label">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    id="docRejectionReason"
                    value={documentRejectionReason}
                    onChange={(e) => setDocumentRejectionReason(e.target.value)}
                    rows={2}
                    className="input"
                    placeholder="Reason for rejecting this document..."
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedDocument(null);
                  setDocumentRejectionReason('');
                }}
                className="btn-secondary"
              >
                Close
              </button>
              {selectedDocument.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      verifyDocumentMutation.mutate({
                        documentId: selectedDocument.id,
                        verified: false,
                        rejectionReason: documentRejectionReason,
                      })
                    }
                    disabled={verifyDocumentMutation.isPending || !documentRejectionReason.trim()}
                    className="btn-secondary text-error-600 hover:bg-error-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      verifyDocumentMutation.mutate({
                        documentId: selectedDocument.id,
                        verified: true,
                      })
                    }
                    disabled={verifyDocumentMutation.isPending}
                    className="btn-primary bg-success-600 hover:bg-success-700"
                  >
                    Verify
                  </button>
                </>
              )}
            </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
