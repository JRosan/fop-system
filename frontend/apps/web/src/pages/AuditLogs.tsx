import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  FileText,
  Eye,
  X,
} from 'lucide-react';
import { auditApi, ENTITY_TYPES, ACTION_LABELS } from '@fop/api';
import type { EntityType, AuditAction, AuditLog } from '@fop/types';
import { formatDate, formatDateTime } from '../utils/date';
import { Portal } from '../components/Portal';

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | ''>('');
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const pageSize = 25;

  // Fetch audit logs
  const { data, isLoading, error } = useQuery({
    queryKey: ['auditLogs', { entityType: entityTypeFilter, action: actionFilter, dateFrom, dateTo, page }],
    queryFn: () =>
      auditApi.getAll({
        entityType: entityTypeFilter || undefined,
        action: actionFilter || undefined,
        fromDate: dateFrom || undefined,
        toDate: dateTo || undefined,
        pageNumber: page,
        pageSize,
      }),
  });

  const clearFilters = () => {
    setEntityTypeFilter('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = entityTypeFilter || actionFilter || dateFrom || dateTo;

  const getEntityLink = (log: AuditLog): string | null => {
    switch (log.entityType) {
      case 'Application':
        return `/applications/${log.entityId}`;
      case 'Permit':
        return `/permits/${log.entityId}`;
      default:
        return null;
    }
  };

  const formatChanges = (jsonString?: string): Record<string, unknown> | null => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Audit Logs</h1>
        <p className="text-neutral-500 mt-1">View system activity and changes</p>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by user email..."
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
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Entity Type</label>
              <select
                value={entityTypeFilter}
                onChange={(e) => {
                  setEntityTypeFilter(e.target.value as EntityType | '');
                  setPage(1);
                }}
                className="input"
              >
                <option value="">All Types</option>
                {ENTITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value as AuditAction | '');
                  setPage(1);
                }}
                className="input"
              >
                <option value="">All Actions</option>
                {Object.entries(ACTION_LABELS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="input"
              />
            </div>

            <div>
              <label className="label">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="input"
              />
            </div>

            {hasActiveFilters && (
              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-error-50 border-error-200">
          <p className="text-error-700">Failed to load audit logs. Please try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-neutral-500 mt-2">Loading audit logs...</p>
        </div>
      )}

      {/* Logs Table */}
      {!isLoading && !error && data && (
        <>
          {data.items.length === 0 ? (
            <div className="card p-8 text-center">
              <History className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
              <h3 className="text-lg font-medium text-neutral-900">No audit logs found</h3>
              <p className="text-neutral-500 mt-1">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'System activity will appear here'}
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                        Entity
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                        User
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {data.items.map((log) => {
                      const actionInfo = ACTION_LABELS[log.action] || {
                        label: log.action,
                        color: 'bg-neutral-100 text-neutral-700',
                      };
                      const entityLink = getEntityLink(log);

                      return (
                        <tr key={log.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-neutral-400" />
                              <span className="text-sm text-neutral-900">
                                {formatDateTime(log.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${actionInfo.color}`}>
                              {actionInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-neutral-400" />
                              <div>
                                <p className="text-sm font-medium text-neutral-900">
                                  {log.entityType}
                                </p>
                                {entityLink ? (
                                  <Link
                                    to={entityLink}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-mono"
                                  >
                                    {log.entityId.slice(0, 8)}...
                                  </Link>
                                ) : (
                                  <span className="text-xs text-neutral-500 font-mono">
                                    {log.entityId.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {log.userEmail ? (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-neutral-600">{log.userEmail}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-neutral-400">System</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-500">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, data.totalCount)} of {data.totalCount} logs
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!data.hasPreviousPage}
                      className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {page} of {data.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!data.hasNextPage}
                      className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <Portal>
          <div className="modal-backdrop">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Audit Log Details</h2>
                <p className="text-neutral-500 mt-1">
                  {formatDateTime(selectedLog.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-500">Action</label>
                  <p>
                    <span
                      className={`badge ${
                        ACTION_LABELS[selectedLog.action]?.color || 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {ACTION_LABELS[selectedLog.action]?.label || selectedLog.action}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">Entity Type</label>
                  <p className="font-medium text-neutral-900">{selectedLog.entityType}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">Entity ID</label>
                  <p className="font-mono text-sm text-neutral-700">{selectedLog.entityId}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">User</label>
                  <p className="text-neutral-900">{selectedLog.userEmail || 'System'}</p>
                </div>
              </div>

              {/* IP and User Agent */}
              {(selectedLog.ipAddress || selectedLog.userAgent) && (
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Request Information</h3>
                  <dl className="space-y-2 text-sm">
                    {selectedLog.ipAddress && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">IP Address</dt>
                        <dd className="font-mono text-neutral-700">{selectedLog.ipAddress}</dd>
                      </div>
                    )}
                    {selectedLog.userAgent && (
                      <div>
                        <dt className="text-neutral-500 mb-1">User Agent</dt>
                        <dd className="text-neutral-700 text-xs break-all">
                          {selectedLog.userAgent}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Old Values */}
              {selectedLog.oldValues && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Previous Values</h3>
                  <pre className="p-4 bg-error-50 rounded-lg text-sm text-error-800 overflow-x-auto">
                    {JSON.stringify(formatChanges(selectedLog.oldValues), null, 2)}
                  </pre>
                </div>
              )}

              {/* New Values */}
              {selectedLog.newValues && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">New Values</h3>
                  <pre className="p-4 bg-success-50 rounded-lg text-sm text-success-800 overflow-x-auto">
                    {JSON.stringify(formatChanges(selectedLog.newValues), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="btn-secondary">
                Close
              </button>
            </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
