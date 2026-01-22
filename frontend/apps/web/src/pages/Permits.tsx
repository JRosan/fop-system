import { Search, Filter, Award } from 'lucide-react';
import { useState } from 'react';

export function Permits() {
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder - would come from API
  const permits: unknown[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Permits</h1>
        <p className="text-neutral-500 mt-1">
          View and manage issued permits
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search permits..."
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

      {/* Permits List */}
      {permits.length === 0 ? (
        <div className="card p-8 text-center">
          <Award className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900">
            No permits yet
          </h3>
          <p className="text-neutral-500 mt-1">
            Approved applications will generate permits that appear here
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-neutral-200">
          {/* Permit rows would go here */}
        </div>
      )}
    </div>
  );
}
