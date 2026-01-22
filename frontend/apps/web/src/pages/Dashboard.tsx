import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';

const stats = [
  {
    name: 'Total Applications',
    value: '0',
    icon: FileText,
    color: 'bg-primary-100 text-primary-600',
  },
  {
    name: 'Pending Review',
    value: '0',
    icon: Clock,
    color: 'bg-warning-100 text-warning-600',
  },
  {
    name: 'Approved This Month',
    value: '0',
    icon: CheckCircle,
    color: 'bg-success-100 text-success-600',
  },
  {
    name: 'Expiring Soon',
    value: '0',
    icon: AlertTriangle,
    color: 'bg-error-100 text-error-600',
  },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">
            Welcome to the BVI Foreign Operator Permit System
          </p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{stat.name}</p>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/applications/new"
            className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">New Application</p>
              <p className="text-sm text-neutral-500">Start a new FOP application</p>
            </div>
          </Link>
          <Link
            to="/fee-calculator"
            className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-secondary-100 text-secondary-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Fee Calculator</p>
              <p className="text-sm text-neutral-500">Estimate permit fees</p>
            </div>
          </Link>
          <Link
            to="/permits"
            className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-success-100 text-success-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">View Permits</p>
              <p className="text-sm text-neutral-500">Manage active permits</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8 text-neutral-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm mt-1">
            Applications and permits will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
