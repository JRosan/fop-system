import { Search, Plus, Building2 } from 'lucide-react';
import { useState } from 'react';

export function Operators() {
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder - would come from API
  const operators: unknown[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Operators</h1>
          <p className="text-neutral-500 mt-1">
            Manage registered operators
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Operator
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search operators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Operators List */}
      {operators.length === 0 ? (
        <div className="card p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900">
            No operators yet
          </h3>
          <p className="text-neutral-500 mt-1 mb-4">
            Add your first operator to get started
          </p>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Operator
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-neutral-200">
          {/* Operator rows would go here */}
        </div>
      )}
    </div>
  );
}
