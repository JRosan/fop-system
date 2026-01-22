import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Building,
  ArrowRightLeft,
  FileText,
  ChevronRight,
  Download,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { paymentsApi, dashboardApi } from '@fop/api';
import type { PaymentWithApplication } from '@fop/api';
import type { PaymentStatus, PaymentMethod } from '@fop/types';
import { formatDate, formatMoney } from '../utils/date';
import { useNotificationStore } from '@fop/core';

const statusColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-success-100 text-success-700',
  FAILED: 'bg-error-100 text-error-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-neutral-100 text-neutral-500',
};

const methodIcons: Record<PaymentMethod, typeof CreditCard> = {
  CREDIT_CARD: CreditCard,
  BANK_TRANSFER: Building,
  WIRE_TRANSFER: ArrowRightLeft,
};

const methodLabels: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  WIRE_TRANSFER: 'Wire Transfer',
};

export function FinanceDashboard() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus[]>([]);
  const [methodFilter, setMethodFilter] = useState<PaymentMethod[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithApplication | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [transactionReference, setTransactionReference] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch finance dashboard stats
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['financeDashboard'],
    queryFn: () => dashboardApi.getFinanceDashboard(),
  });

  // Fetch all payments
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', { search: searchTerm, status: statusFilter, method: methodFilter }],
    queryFn: () =>
      paymentsApi.getAll({
        search: searchTerm || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        method: methodFilter.length > 0 ? methodFilter : undefined,
        pageSize: 50,
      }),
  });

  // Fetch pending payments for quick action
  const { data: pendingPayments } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: () => paymentsApi.getPending(),
  });

  // Verify payment mutation
  const verifyMutation = useMutation({
    mutationFn: ({ paymentId, reference, notes }: { paymentId: string; reference: string; notes?: string }) =>
      paymentsApi.verifyBankTransfer(paymentId, reference, notes),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['financeDashboard'] });
      setShowVerifyModal(false);
      setSelectedPayment(null);
      setTransactionReference('');
      setVerifyNotes('');
      success('Payment Verified', `Receipt number: ${result.receiptNumber}`);
    },
    onError: () => {
      showError('Error', 'Failed to verify payment.');
    },
  });

  // Reject payment mutation
  const rejectMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      paymentsApi.rejectPayment(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['financeDashboard'] });
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectReason('');
      success('Payment Rejected', 'The payment has been rejected.');
    },
    onError: () => {
      showError('Error', 'Failed to reject payment.');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const toggleStatusFilter = (status: PaymentStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleMethodFilter = (method: PaymentMethod) => {
    setMethodFilter((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const openVerifyModal = (payment: PaymentWithApplication) => {
    setSelectedPayment(payment);
    setTransactionReference(payment.transactionReference || '');
    setShowVerifyModal(true);
  };

  const openRejectModal = (payment: PaymentWithApplication) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

  const isLoading = dashboardLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Finance Dashboard</h1>
        <p className="text-neutral-500 mt-1">Manage payments and track revenue</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {dashboardData?.pendingPayments ?? '-'}
              </p>
              <p className="text-sm text-neutral-500">Pending Payments</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {dashboardData?.pendingWaivers ?? '-'}
              </p>
              <p className="text-sm text-neutral-500">Pending Waivers</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success-100">
              <DollarSign className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {dashboardData?.collectedToday
                  ? formatMoney(dashboardData.collectedToday.amount, dashboardData.collectedToday.currency)
                  : '-'}
              </p>
              <p className="text-sm text-neutral-500">Collected Today</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {dashboardData?.collectedThisMonth
                  ? formatMoney(dashboardData.collectedThisMonth.amount, dashboardData.collectedThisMonth.currency)
                  : '-'}
              </p>
              <p className="text-sm text-neutral-500">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Quick Action */}
      {pendingPayments && pendingPayments.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-neutral-200 bg-yellow-50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Payments Awaiting Verification ({pendingPayments.length})
              </h2>
            </div>
          </div>
          <div className="divide-y divide-neutral-200">
            {pendingPayments.slice(0, 5).map((payment) => {
              const MethodIcon = methodIcons[payment.method];
              return (
                <div
                  key={payment.id}
                  className="p-4 flex items-center justify-between hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-neutral-100">
                      <MethodIcon className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{payment.applicationNumber}</p>
                      <p className="text-sm text-neutral-500">{payment.operatorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">
                        {formatMoney(payment.amount.amount, payment.amount.currency)}
                      </p>
                      <p className="text-sm text-neutral-500">{methodLabels[payment.method]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openVerifyModal(payment)}
                        className="btn-primary text-sm py-1.5 px-3 bg-success-600 hover:bg-success-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verify
                      </button>
                      <button
                        onClick={() => openRejectModal(payment)}
                        className="btn-secondary text-sm py-1.5 px-3 text-error-600 hover:bg-error-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by application number or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-neutral-300' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(statusFilter.length > 0 || methodFilter.length > 0) && (
              <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                {statusFilter.length + methodFilter.length}
              </span>
            )}
          </button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
            <div>
              <label className="label">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'] as PaymentStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatusFilter(status)}
                      className={`badge cursor-pointer ${
                        statusFilter.includes(status)
                          ? statusColors[status]
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="label">Payment Method</label>
              <div className="flex flex-wrap gap-2">
                {(['CREDIT_CARD', 'BANK_TRANSFER', 'WIRE_TRANSFER'] as PaymentMethod[]).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => toggleMethodFilter(method)}
                      className={`badge cursor-pointer ${
                        methodFilter.includes(method)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {methodLabels[method]}
                    </button>
                  )
                )}
              </div>
            </div>

            {(statusFilter.length > 0 || methodFilter.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter([]);
                  setMethodFilter([]);
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payments List */}
      <div className="card">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">All Payments</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-neutral-500 mt-2">Loading payments...</p>
          </div>
        ) : !paymentsData?.items?.length ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <h3 className="text-lg font-medium text-neutral-900">No payments found</h3>
            <p className="text-neutral-500 mt-1">
              {searchTerm || statusFilter.length || methodFilter.length
                ? 'Try adjusting your search or filters'
                : 'Payments will appear here as applications are processed'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                    Application
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                    Operator
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paymentsData.items.map((payment) => {
                  const MethodIcon = methodIcons[payment.method];
                  return (
                    <tr key={payment.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/applications/${payment.applicationId}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {payment.applicationNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{payment.operatorName}</td>
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {formatMoney(payment.amount.amount, payment.amount.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-600">{methodLabels[payment.method]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColors[payment.status]}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {(payment.status === 'PENDING' || payment.status === 'PROCESSING') && (
                            <>
                              <button
                                onClick={() => openVerifyModal(payment)}
                                className="p-1.5 rounded hover:bg-success-100 text-success-600"
                                title="Verify Payment"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openRejectModal(payment)}
                                className="p-1.5 rounded hover:bg-error-100 text-error-600"
                                title="Reject Payment"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {payment.receiptNumber && (
                            <button
                              onClick={() => {
                                // Download receipt
                              }}
                              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600"
                              title="Download Receipt"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/applications/${payment.applicationId}`}
                            className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600"
                            title="View Application"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Verify Payment</h2>
              <p className="text-neutral-500 mt-1">
                Confirm payment for {selectedPayment.applicationNumber}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Amount</dt>
                    <dd className="font-semibold text-neutral-900">
                      {formatMoney(selectedPayment.amount.amount, selectedPayment.amount.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Method</dt>
                    <dd className="text-neutral-900">{methodLabels[selectedPayment.method]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Operator</dt>
                    <dd className="text-neutral-900">{selectedPayment.operatorName}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <label htmlFor="transactionReference" className="label">
                  Transaction Reference <span className="text-error-500">*</span>
                </label>
                <input
                  id="transactionReference"
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="input"
                  placeholder="Enter bank transaction reference..."
                />
              </div>

              <div>
                <label htmlFor="verifyNotes" className="label">
                  Notes (Optional)
                </label>
                <textarea
                  id="verifyNotes"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
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
                  setShowVerifyModal(false);
                  setSelectedPayment(null);
                  setTransactionReference('');
                  setVerifyNotes('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  verifyMutation.mutate({
                    paymentId: selectedPayment.id,
                    reference: transactionReference,
                    notes: verifyNotes || undefined,
                  })
                }
                disabled={verifyMutation.isPending || !transactionReference.trim()}
                className="btn-primary bg-success-600 hover:bg-success-700"
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Verify Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Reject Payment</h2>
              <p className="text-neutral-500 mt-1">
                Reject payment for {selectedPayment.applicationNumber}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-error-700 text-sm">
                  Rejecting this payment will notify the applicant and they will need to submit a
                  new payment.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Amount</dt>
                    <dd className="font-semibold text-neutral-900">
                      {formatMoney(selectedPayment.amount.amount, selectedPayment.amount.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Method</dt>
                    <dd className="text-neutral-900">{methodLabels[selectedPayment.method]}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <label htmlFor="rejectReason" className="label">
                  Rejection Reason <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Provide a reason for rejection..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPayment(null);
                  setRejectReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  rejectMutation.mutate({
                    paymentId: selectedPayment.id,
                    reason: rejectReason,
                  })
                }
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="btn-primary bg-error-600 hover:bg-error-700"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
