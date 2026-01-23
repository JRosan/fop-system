import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  Building2,
  Plane,
} from 'lucide-react';
import { permitsApi } from '@fop/api';
import type { PermitVerification } from '@fop/types';
import { formatDate } from '../utils/date';

export function VerifyPermit() {
  const [permitNumber, setPermitNumber] = useState('');
  const [result, setResult] = useState<PermitVerification | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (number: string) => permitsApi.verify(number),
    onSuccess: (data) => {
      setResult(data);
    },
    onError: () => {
      setResult({
        isValid: false,
        message: 'Unable to verify permit. Please check the permit number and try again.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (permitNumber.trim()) {
      setResult(null);
      verifyMutation.mutate(permitNumber.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bvi-atlantic-100 mb-4">
          <Award className="w-8 h-8 text-bvi-atlantic-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Verify Permit</h1>
        <p className="text-neutral-500 mt-2">
          Enter a Foreign Operator Permit number to verify its validity
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="permitNumber" className="label">
              Permit Number
            </label>
            <div className="relative">
              <input
                id="permitNumber"
                type="text"
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value.toUpperCase())}
                placeholder="e.g., FOP-2024-001234"
                className="input pl-10 font-mono"
                autoComplete="off"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>
          <button
            type="submit"
            disabled={verifyMutation.isPending || !permitNumber.trim()}
            className="btn-primary w-full"
          >
            {verifyMutation.isPending ? 'Verifying...' : 'Verify Permit'}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="card overflow-hidden">
          {/* Status Header */}
          <div
            className={`p-6 ${
              result.isValid
                ? 'bg-success-50 border-b border-success-200'
                : 'bg-error-50 border-b border-error-200'
            }`}
          >
            <div className="flex items-center gap-4">
              {result.isValid ? (
                <div className="p-3 rounded-full bg-success-100">
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
              ) : (
                <div className="p-3 rounded-full bg-error-100">
                  <XCircle className="w-8 h-8 text-error-600" />
                </div>
              )}
              <div>
                <h2
                  className={`text-xl font-semibold ${
                    result.isValid ? 'text-success-800' : 'text-error-800'
                  }`}
                >
                  {result.isValid ? 'Valid Permit' : 'Invalid Permit'}
                </h2>
                <p
                  className={`text-sm ${
                    result.isValid ? 'text-success-600' : 'text-error-600'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>
          </div>

          {/* Permit Details */}
          {result.isValid && result.permit && (
            <div className="p-6 space-y-6">
              {/* Permit Status Alert */}
              {result.permit.status === 'SUSPENDED' && (
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning-800">Permit Suspended</p>
                      <p className="text-sm text-warning-600">
                        This permit is currently suspended and not valid for operations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.permit.status === 'EXPIRED' && (
                <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-700">Permit Expired</p>
                      <p className="text-sm text-neutral-500">
                        This permit has expired and is no longer valid for operations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Permit Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">Permit Details</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-neutral-400">Permit Number</dt>
                      <dd className="font-mono font-semibold text-neutral-900">
                        {result.permit.permitNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-neutral-400">Type</dt>
                      <dd className="text-neutral-900">
                        {result.permit.type === 'OneTime'
                          ? 'One-Time Permit'
                          : result.permit.type === 'Blanket'
                          ? 'Blanket Permit'
                          : 'Emergency Permit'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-neutral-400">Status</dt>
                      <dd>
                        <span
                          className={`badge ${
                            result.permit.status === 'ACTIVE'
                              ? 'bg-success-100 text-success-700'
                              : result.permit.status === 'SUSPENDED'
                              ? 'bg-warning-100 text-warning-700'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {result.permit.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">Validity Period</h3>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="text-neutral-900">
                        {formatDate(result.permit.validityPeriod.startDate)} to{' '}
                        {formatDate(result.permit.validityPeriod.endDate)}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        Issued: {formatDate(result.permit.issuedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-neutral-200" />

              {/* Operator & Aircraft */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-medium text-neutral-500">Operator</h3>
                  </div>
                  <p className="text-neutral-900 font-medium">{result.permit.operatorName}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Plane className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-medium text-neutral-500">Aircraft</h3>
                  </div>
                  <p className="text-neutral-900 font-medium">
                    {result.permit.aircraftRegistration}
                  </p>
                </div>
              </div>

              {/* Conditions */}
              {result.permit.conditions && result.permit.conditions.length > 0 && (
                <>
                  <hr className="border-neutral-200" />
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-3">Conditions</h3>
                    <ul className="space-y-2">
                      {result.permit.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="text-bvi-atlantic-600 mt-0.5">•</span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="card p-6 bg-neutral-50">
        <h3 className="font-medium text-neutral-900 mb-2">About Permit Verification</h3>
        <p className="text-sm text-neutral-600">
          This service allows third parties to verify the authenticity and validity of Foreign
          Operator Permits issued by the British Virgin Islands Civil Aviation Department. A valid
          permit confirms that the operator is authorized to conduct the specified aviation
          operations within BVI airspace.
        </p>
        <p className="text-sm text-neutral-500 mt-3">
          For questions about permit verification, contact the BVI Civil Aviation Department.
        </p>
      </div>
    </div>
  );
}
