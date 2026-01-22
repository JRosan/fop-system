import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { dashboardApi } from '@fop/api';
import { useNotificationStore } from '@fop/core';
import { formatDistanceToNow } from '../utils/date';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-700',
  SUBMITTED: 'bg-primary-100 text-primary-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  PENDING_DOCUMENTS: 'bg-warning-100 text-warning-700',
  PENDING_PAYMENT: 'bg-pink-100 text-pink-700',
  APPROVED: 'bg-success-100 text-success-700',
  REJECTED: 'bg-error-100 text-error-700',
};

export function Dashboard() {
  const { error: showError } = useNotificationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'applicant'],
    queryFn: () => dashboardApi.getApplicantDashboard(),
  });

  if (error) {
    showError('Failed to load dashboard', (error as Error).message);
  }

  const stats = [
    {
      name: 'Total Applications',
      value: data?.totalApplications ?? 0,
      icon: FileText,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      name: 'Pending Review',
      value: data?.pendingReview ?? 0,
      icon: Clock,
      color: 'bg-warning-100 text-warning-600',
    },
    {
      name: 'Approved This Month',
      value: data?.approvedThisMonth ?? 0,
      icon: CheckCircle,
      color: 'bg-success-100 text-success-600',
    },
    {
      name: 'Expiring Soon',
      value: data?.expiringSoon ?? 0,
      icon: AlertTriangle,
      color: 'bg-error-100 text-error-600',
    },
  ];

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
                <p className="text-2xl font-bold text-neutral-900">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-neutral-200 animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
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

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Recent Applications
          </h2>
          <Link
            to="/applications"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : data?.recentApplications && data.recentApplications.length > 0 ? (
          <div className="divide-y divide-neutral-200">
            {data.recentApplications.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="flex items-center justify-between py-3 hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {app.applicationNumber}
                  </p>
                  <p className="text-sm text-neutral-500">{app.operatorName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${statusColors[app.status] || 'bg-neutral-100 text-neutral-700'}`}
                  >
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {formatDistanceToNow(app.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">
              Applications and permits will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
