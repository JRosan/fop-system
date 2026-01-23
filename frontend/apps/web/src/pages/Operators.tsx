import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search, Plus, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { useState } from 'react';
import { operatorsApi } from '@fop/api';
import { formatDate } from '../utils/date';

export function Operators() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['operators', { search: searchTerm, page, pageSize }],
    queryFn: () =>
      operatorsApi.getAll({
        search: searchTerm || undefined,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Operators</h1>
          <p className="text-neutral-500 mt-1">View registered aircraft operators</p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by operator name, country, or AOC number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-error-50 border-error-200">
          <p className="text-error-700">Failed to load operators. Please try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                <div className="h-4 w-2/3 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Operators Grid */}
      {!isLoading && !error && data && (
        <>
          {data.items.length === 0 ? (
            <div className="card p-8 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
              <h3 className="text-lg font-medium text-neutral-900">
                {searchTerm ? 'No operators found' : 'No operators yet'}
              </h3>
              <p className="text-neutral-500 mt-1 mb-4">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Operators are created when you submit an application'}
              </p>
              <Link to="/applications/new" className="btn-primary inline-flex">
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((operator) => (
                <div
                  key={operator.id}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bvi-atlantic-100">
                        <Building2 className="w-5 h-5 text-bvi-atlantic-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">{operator.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <Globe className="w-3 h-3" />
                          {operator.country}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">AOC Number</dt>
                        <dd className="font-medium text-neutral-900">{operator.aocNumber}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">AOC Expiry</dt>
                        <dd className="font-medium text-neutral-900">
                          {formatDate(operator.aocExpiryDate)}
                        </dd>
                      </div>
                    </dl>
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
                {Math.min(page * pageSize, data.totalCount)} of {data.totalCount} operators
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
