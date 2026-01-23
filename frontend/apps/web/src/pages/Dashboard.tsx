import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { dashboardApi } from '@fop/api';
import { useNotificationStore } from '@fop/core';
import { formatDistanceToNow } from '../utils/date';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-700 dark:bg-bvi-granite-700 dark:text-bvi-granite-200',
  SUBMITTED: 'bg-bvi-atlantic-100 text-bvi-atlantic-700 dark:bg-bvi-atlantic-800 dark:text-bvi-atlantic-300',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  PENDING_DOCUMENTS: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
  PENDING_PAYMENT: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  APPROVED: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  REJECTED: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
};

export function Dashboard() {
  const { error: showError } = useNotificationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'applicant'],
    queryFn: () => dashboardApi.getApplicantDashboard(),
  });

  useEffect(() => {
    if (error) {
      showError('Failed to load dashboard', (error as Error).message);
    }
  }, [error, showError]);

  const stats = [
    {
      name: 'Total Applications',
      value: data?.totalApplications ?? 0,
      icon: FileText,
      color: 'bg-bvi-atlantic-100 text-bvi-atlantic-600 dark:bg-bvi-atlantic-800 dark:text-bvi-atlantic-300',
    },
    {
      name: 'Pending',
      value: data?.pendingApplications ?? 0,
      icon: Clock,
      color: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    },
    {
      name: 'Active Permits',
      value: data?.activePermits ?? 0,
      icon: CheckCircle,
      color: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    },
    {
      name: 'Expiring Soon',
      value: data?.expiringPermits ?? 0,
      icon: AlertTriangle,
      color: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="text-neutral-500 dark:text-bvi-granite-400 mt-1">
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
                <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">{stat.name}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-neutral-200 dark:bg-bvi-granite-700 animate-pulse rounded" />
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
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/applications/new"
            className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-bvi-granite-700 hover:border-bvi-turquoise-300 dark:hover:border-bvi-turquoise-500 hover:bg-bvi-atlantic-50 dark:hover:bg-bvi-atlantic-800 transition-colors"
          >
            <div className="p-2 rounded-lg bg-bvi-atlantic-100 text-bvi-atlantic-600 dark:bg-bvi-atlantic-800 dark:text-bvi-atlantic-300">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">New Application</p>
              <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">Start a new FOP application</p>
            </div>
          </Link>
          <Link
            to="/fee-calculator"
            className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-bvi-granite-700 hover:border-bvi-turquoise-300 dark:hover:border-bvi-turquoise-500 hover:bg-bvi-atlantic-50 dark:hover:bg-bvi-atlantic-800 transition-colors"
          >
            <div className="p-2 rounded-lg bg-bvi-turquoise-100 text-bvi-turquoise-600 dark:bg-bvi-turquoise-900/30 dark:text-bvi-turquoise-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">Fee Calculator</p>
              <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">Estimate permit fees</p>
            </div>
          </Link>
          <Link
            to="/permits"
            className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-bvi-granite-700 hover:border-bvi-turquoise-300 dark:hover:border-bvi-turquoise-500 hover:bg-bvi-atlantic-50 dark:hover:bg-bvi-atlantic-800 transition-colors"
          >
            <div className="p-2 rounded-lg bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">View Permits</p>
              <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">Manage active permits</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Applications
          </h2>
          <Link
            to="/applications"
            className="text-sm text-bvi-turquoise-600 hover:text-bvi-turquoise-700 dark:text-bvi-turquoise-400 dark:hover:text-bvi-turquoise-300 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 dark:bg-bvi-granite-700 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : data?.recentApplications && data.recentApplications.length > 0 ? (
          <div className="divide-y divide-neutral-200 dark:divide-bvi-granite-700">
            {data.recentApplications.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="flex items-center justify-between py-3 hover:bg-neutral-50 dark:hover:bg-bvi-atlantic-800 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {app.applicationNumber}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-bvi-granite-400">{app.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${statusColors[app.status] || 'bg-neutral-100 text-neutral-700 dark:bg-bvi-granite-700 dark:text-bvi-granite-200'}`}
                  >
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-neutral-400 dark:text-bvi-granite-500">
                    {formatDistanceToNow(app.submittedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500 dark:text-bvi-granite-400">
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
