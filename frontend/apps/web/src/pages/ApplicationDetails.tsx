import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  Building2,
  Plane,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Send,
} from 'lucide-react';
import { applicationsApi } from '@fop/api';
import { useNotificationStore } from '@fop/core';
import type { ApplicationStatus, ApplicationType, DocumentType } from '@fop/types';
import { formatDate, formatDateTime, formatMoney } from '../utils/date';

const statusColors: Record<ApplicationStatus, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-700',
  SUBMITTED: 'bg-primary-100 text-primary-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  PENDING_DOCUMENTS: 'bg-warning-100 text-warning-700',
  PENDING_PAYMENT: 'bg-pink-100 text-pink-700',
  APPROVED: 'bg-success-100 text-success-700',
  REJECTED: 'bg-error-100 text-error-700',
  EXPIRED: 'bg-neutral-100 text-neutral-500',
  CANCELLED: 'bg-neutral-100 text-neutral-500',
};

const typeLabels: Record<ApplicationType, string> = {
  ONE_TIME: 'One-Time Permit',
  BLANKET: 'Blanket Permit',
  EMERGENCY: 'Emergency Permit',
};

const documentTypeLabels: Record<DocumentType, string> = {
  CERTIFICATE_OF_AIRWORTHINESS: 'Certificate of Airworthiness',
  CERTIFICATE_OF_REGISTRATION: 'Certificate of Registration',
  AIR_OPERATOR_CERTIFICATE: 'Air Operator Certificate',
  INSURANCE_CERTIFICATE: 'Insurance Certificate',
  NOISE_CERTIFICATE: 'Noise Certificate',
  CREW_LICENSES: 'Crew Licenses',
  RADIO_LICENSE: 'Radio License',
  OTHER: 'Other Document',
};

const purposeLabels: Record<string, string> = {
  CHARTER: 'Charter Flight',
  CARGO: 'Cargo Operations',
  TECHNICAL_LANDING: 'Technical Landing',
  MEDEVAC: 'Medical Evacuation',
  PRIVATE: 'Private Flight',
  OTHER: 'Other',
};

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationStore();

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => applicationsApi.submit(id!),
    onSuccess: () => {
      success('Application Submitted', 'Your application has been submitted for review.');
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (err: Error) => {
      showError('Submit Failed', err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="card p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-neutral-200 rounded" />
            <div className="h-4 w-2/3 bg-neutral-200 rounded" />
            <div className="h-4 w-1/2 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/applications" className="p-2 rounded-lg hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Application Details</h1>
          </div>
        </div>

        <div className="card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900">Application not found</h3>
          <p className="text-neutral-500 mt-1">
            The application you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/applications" className="btn-primary mt-4 inline-flex">
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const canSubmit = application.status === 'DRAFT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/applications" className="p-2 rounded-lg hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                {application.applicationNumber}
              </h1>
              <span className={`badge ${statusColors[application.status]}`}>
                {application.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-neutral-500">{typeLabels[application.type]}</p>
          </div>
        </div>

        {canSubmit && (
          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="btn-primary"
          >
            {submitMutation.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </button>
        )}
      </div>

      {/* Status Timeline */}
      {application.status === 'REJECTED' && application.rejectionReason && (
        <div className="card p-4 bg-error-50 border-error-200">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-error-600 mt-0.5" />
            <div>
              <p className="font-medium text-error-800">Application Rejected</p>
              <p className="text-sm text-error-700 mt-1">{application.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {application.status === 'APPROVED' && (
        <div className="card p-4 bg-success-50 border-success-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
            <div>
              <p className="font-medium text-success-800">Application Approved</p>
              {application.approvedAt && (
                <p className="text-sm text-success-700 mt-1">
                  Approved on {formatDateTime(application.approvedAt)}
                  {application.approvedBy && ` by ${application.approvedBy}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operator Details */}
          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900">Operator Details</h2>
              </div>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-neutral-500">Operator Name</dt>
                  <dd className="font-medium text-neutral-900">{application.operator.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Country</dt>
                  <dd className="font-medium text-neutral-900">{application.operator.country}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">AOC Number</dt>
                  <dd className="font-medium text-neutral-900">{application.operator.aocNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">AOC Expiry</dt>
                  <dd className="font-medium text-neutral-900">
                    {formatDate(application.operator.aocExpiryDate)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-neutral-500">Contact</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.operator.contactInfo.email} | {application.operator.contactInfo.phone}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Aircraft Details */}
          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900">Aircraft Details</h2>
              </div>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-neutral-500">Registration</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.aircraft.registrationNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Type</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.aircraft.manufacturer} {application.aircraft.model}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Serial Number</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.aircraft.serialNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Seat Capacity</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.aircraft.seatCapacity} seats
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">MTOW</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.aircraft.mtow.value.toLocaleString()} {application.aircraft.mtow.unit}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Category</dt>
                  <dd className="font-medium text-neutral-900">{application.aircraft.category}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Flight Details */}
          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900">Flight Details</h2>
              </div>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-neutral-500">Purpose</dt>
                  <dd className="font-medium text-neutral-900">
                    {purposeLabels[application.flightDetails.purpose] || application.flightDetails.purpose}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Estimated Flight Date</dt>
                  <dd className="font-medium text-neutral-900">
                    {formatDate(application.flightDetails.estimatedFlightDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Departure</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.flightDetails.departureAirport}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Arrival</dt>
                  <dd className="font-medium text-neutral-900">
                    {application.flightDetails.arrivalAirport}
                  </dd>
                </div>
                {application.flightDetails.numberOfPassengers && (
                  <div>
                    <dt className="text-sm text-neutral-500">Passengers</dt>
                    <dd className="font-medium text-neutral-900">
                      {application.flightDetails.numberOfPassengers}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-neutral-500">Permit Period</dt>
                  <dd className="font-medium text-neutral-900">
                    {formatDate(application.requestedPeriod.startDate)} -{' '}
                    {formatDate(application.requestedPeriod.endDate)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900">Documents</h2>
              </div>
            </div>
            <div className="divide-y divide-neutral-200">
              {application.documents.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  No documents uploaded
                </div>
              ) : (
                application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">
                          {documentTypeLabels[doc.type] || doc.type}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {doc.expiryDate && `Expires: ${formatDate(doc.expiryDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`badge ${
                          doc.verificationStatus === 'VERIFIED'
                            ? 'bg-success-100 text-success-700'
                            : doc.verificationStatus === 'REJECTED'
                            ? 'bg-error-100 text-error-700'
                            : 'bg-warning-100 text-warning-700'
                        }`}
                      >
                        {doc.verificationStatus}
                      </span>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-neutral-100"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fee Summary */}
          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900">Fee Summary</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-neutral-500">Total Fee</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {formatMoney(application.calculatedFee.amount, application.calculatedFee.currency)}
                </p>
              </div>
              {application.payment ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Payment Status</span>
                    <span
                      className={`font-medium ${
                        application.payment.status === 'COMPLETED'
                          ? 'text-success-600'
                          : application.payment.status === 'FAILED'
                          ? 'text-error-600'
                          : 'text-warning-600'
                      }`}
                    >
                      {application.payment.status}
                    </span>
                  </div>
                  {application.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Paid On</span>
                      <span className="font-medium">{formatDate(application.payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              ) : application.status === 'PENDING_PAYMENT' ? (
                <button className="btn-primary w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Now
                </button>
              ) : (
                <p className="text-sm text-neutral-500 text-center">
                  Payment pending application approval
                </p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900">Timeline</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full" />
                    <div className="w-0.5 h-full bg-neutral-200" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-neutral-900">Created</p>
                    <p className="text-sm text-neutral-500">
                      {formatDateTime(application.createdAt)}
                    </p>
                  </div>
                </div>
                {application.submittedAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                      <div className="w-0.5 h-full bg-neutral-200" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-neutral-900">Submitted</p>
                      <p className="text-sm text-neutral-500">
                        {formatDateTime(application.submittedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {application.reviewedAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                      <div className="w-0.5 h-full bg-neutral-200" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-neutral-900">Reviewed</p>
                      <p className="text-sm text-neutral-500">
                        {formatDateTime(application.reviewedAt)}
                        {application.reviewedBy && ` by ${application.reviewedBy}`}
                      </p>
                    </div>
                  </div>
                )}
                {application.approvedAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-success-600 rounded-full" />
                    <div>
                      <p className="font-medium text-neutral-900">Approved</p>
                      <p className="text-sm text-neutral-500">
                        {formatDateTime(application.approvedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
