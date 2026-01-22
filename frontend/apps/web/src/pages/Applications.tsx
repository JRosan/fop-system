import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { useState } from 'react';

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

export function Applications() {
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder data - would come from API
  const applications: unknown[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Applications</h1>
          <p className="text-neutral-500 mt-1">
            Manage your FOP applications
          </p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button className="btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900">
            No applications yet
          </h3>
          <p className="text-neutral-500 mt-1 mb-4">
            Get started by creating your first FOP application
          </p>
          <Link to="/applications/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-neutral-200">
          {/* Application rows would go here */}
        </div>
      )}
    </div>
  );
}
