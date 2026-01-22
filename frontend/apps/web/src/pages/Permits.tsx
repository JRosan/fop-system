import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Search, Filter, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { permitsApi } from '@fop/api';
import type { PermitStatus, ApplicationType } from '@fop/types';
import { formatDate } from '../utils/date';

const statusColors: Record<PermitStatus, string> = {
  ACTIVE: 'bg-success-100 text-success-700',
  EXPIRED: 'bg-neutral-100 text-neutral-500',
  REVOKED: 'bg-error-100 text-error-700',
  SUSPENDED: 'bg-warning-100 text-warning-700',
};

const typeLabels: Record<ApplicationType, string> = {
  ONE_TIME: 'One-Time',
  BLANKET: 'Blanket',
  EMERGENCY: 'Emergency',
};

export function Permits() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PermitStatus[]>([]);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['permits', { search: searchTerm, status: statusFilter, page, pageSize }],
    queryFn: () =>
      permitsApi.getAll({
        search: searchTerm || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
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

  const toggleStatus = (status: PermitStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Permits</h1>
          <p className="text-neutral-500 mt-1">View and manage issued permits</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by permit number or operator..."
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
            {statusFilter.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                {statusFilter.length}
              </span>
            )}
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="label">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED'] as PermitStatus[]).map((status) => (
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
                    {status}
                  </button>
                ))}
              </div>
            </div>
            {statusFilter.length > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter([])}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-error-50 border-error-200">
          <p className="text-error-700">Failed to load permits. Please try again.</p>
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
                <div className="h-6 w-20 bg-neutral-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permits List */}
      {!isLoading && !error && data && (
        <>
          {data.items.length === 0 ? (
            <div className="card p-8 text-center">
              <Award className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
              <h3 className="text-lg font-medium text-neutral-900">
                {searchTerm || statusFilter.length ? 'No permits found' : 'No permits yet'}
              </h3>
              <p className="text-neutral-500 mt-1 mb-4">
                {searchTerm || statusFilter.length
                  ? 'Try adjusting your search or filters'
                  : 'Permits will appear here after applications are approved'}
              </p>
            </div>
          ) : (
            <div className="card divide-y divide-neutral-200">
              {data.items.map((permit) => (
                <div
                  key={permit.id}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-neutral-900">{permit.permitNumber}</p>
                      <span className="badge bg-neutral-100 text-neutral-600">
                        {typeLabels[permit.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                      <span>{permit.operatorName}</span>
                      <span>{permit.aircraftRegistration}</span>
                      <span>
                        Valid: {formatDate(permit.validityPeriod.startDate)} -{' '}
                        {formatDate(permit.validityPeriod.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className={`badge ${statusColors[permit.status]}`}>{permit.status}</span>
                    <Link
                      to={`/applications/${permit.id}`}
                      className="p-2 rounded-lg hover:bg-neutral-100"
                      title="View details"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, data.totalCount)} of {data.totalCount} permits
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
