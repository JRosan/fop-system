import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { applicationsApi } from '@fop/api';
import type { ApplicationStatus, ApplicationType } from '@fop/types';
import { formatDate, formatMoney } from '../utils/date';

const statusColors: Record<string, string> = {
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
  ONE_TIME: 'One-Time',
  BLANKET: 'Blanket',
  EMERGENCY: 'Emergency',
};

export function Applications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<ApplicationType[]>([]);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['applications', { search: searchTerm, status: statusFilter, type: typeFilter, page, pageSize }],
    queryFn: () =>
      applicationsApi.getAll({
        search: searchTerm || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        type: typeFilter.length > 0 ? typeFilter : undefined,
        pageNumber: page,
        pageSize,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      prev.set('search', searchTerm);
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const toggleStatus = (status: ApplicationStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleType = (type: ApplicationType) => {
    setTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Applications</h1>
          <p className="text-neutral-500 mt-1">Manage your FOP applications</p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Link>
      </div>

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
          <button type="submit" className="btn-primary">
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-neutral-300' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(statusFilter.length > 0 || typeFilter.length > 0) && (
              <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                {statusFilter.length + typeFilter.length}
              </span>
            )}
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'PENDING_PAYMENT', 'APPROVED', 'REJECTED'] as ApplicationStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleStatus(status)}
                        className={`badge cursor-pointer ${
                          statusFilter.includes(status)
                            ? statusColors[status]
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {status.replace(/_/g, ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div>
                <label className="label">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['ONE_TIME', 'BLANKET', 'EMERGENCY'] as ApplicationType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={`badge cursor-pointer ${
                        typeFilter.includes(type)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {typeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {(statusFilter.length > 0 || typeFilter.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter([]);
                  setTypeFilter([]);
                }}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-error-50 border-error-200">
          <p className="text-error-700">Failed to load applications. Please try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card divide-y divide-neutral-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-neutral-200 rounded" />
                  <div className="h-4 w-48 bg-neutral-200 rounded" />
                </div>
                <div className="h-6 w-24 bg-neutral-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applications List */}
      {!isLoading && !error && data && (
        <>
          {data.items.length === 0 ? (
            <div className="card p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
              <h3 className="text-lg font-medium text-neutral-900">
                {searchTerm || statusFilter.length || typeFilter.length
                  ? 'No applications found'
                  : 'No applications yet'}
              </h3>
              <p className="text-neutral-500 mt-1 mb-4">
                {searchTerm || statusFilter.length || typeFilter.length
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first FOP application'}
              </p>
              {!searchTerm && !statusFilter.length && !typeFilter.length && (
                <Link to="/applications/new" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Link>
              )}
            </div>
          ) : (
            <div className="card divide-y divide-neutral-200">
              {data.items.map((application) => (
                <Link
                  key={application.id}
                  to={`/applications/${application.id}`}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-neutral-900">
                        {application.applicationNumber}
                      </p>
                      <span className="badge bg-neutral-100 text-neutral-600">
                        {typeLabels[application.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                      <span>{application.operatorName}</span>
                      <span>{application.aircraftRegistration}</span>
                      <span>{formatDate(application.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm font-medium text-neutral-900">
                      {formatMoney(application.calculatedFee.amount, application.calculatedFee.currency)}
                    </span>
                    <span className={`badge ${statusColors[application.status]}`}>
                      {application.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, data.totalCount)} of {data.totalCount} applications
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!data.hasPreviousPage}
                  className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!data.hasNextPage}
                  className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
