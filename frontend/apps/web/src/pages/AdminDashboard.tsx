import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building2,
  FileText,
  Award,
  TrendingUp,
  BarChart3,
  Activity,
  Settings,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { dashboardApi } from '@fop/api';
import { formatMoney } from '../utils/date';

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  PENDING_DOCUMENTS: 'Pending Documents',
  PENDING_PAYMENT: 'Pending Payment',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-neutral-100',
  SUBMITTED: 'bg-blue-100',
  UNDER_REVIEW: 'bg-yellow-100',
  PENDING_DOCUMENTS: 'bg-orange-100',
  PENDING_PAYMENT: 'bg-purple-100',
  APPROVED: 'bg-success-100',
  REJECTED: 'bg-error-100',
  EXPIRED: 'bg-neutral-200',
  CANCELLED: 'bg-neutral-200',
};

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');

  // Fetch admin dashboard stats
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => dashboardApi.getAdminDashboard(),
  });

  // Calculate percentages for status chart
  const getStatusPercentage = (status: string) => {
    if (!dashboardData?.applicationsByStatus || dashboardData.totalApplications === 0) return 0;
    const count = dashboardData.applicationsByStatus[status] || 0;
    return Math.round((count / dashboardData.totalApplications) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">System overview and administration</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-100">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {isLoading ? '-' : dashboardData?.totalUsers ?? 0}
                  </p>
                  <p className="text-sm text-neutral-500">Total Users</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {isLoading ? '-' : dashboardData?.totalOperators ?? 0}
                  </p>
                  <p className="text-sm text-neutral-500">Operators</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {isLoading ? '-' : dashboardData?.totalApplications ?? 0}
                  </p>
                  <p className="text-sm text-neutral-500">Applications</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success-100">
                  <Award className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {isLoading ? '-' : dashboardData?.totalPermits ?? 0}
                  </p>
                  <p className="text-sm text-neutral-500">Active Permits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue and Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Revenue This Month</h2>
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <p className="text-4xl font-bold text-neutral-900">
                {dashboardData?.revenueThisMonth
                  ? formatMoney(
                      dashboardData.revenueThisMonth.amount,
                      dashboardData.revenueThisMonth.currency
                    )
                  : '$0.00'}
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                From permit fees and application processing
              </p>
            </div>

            {/* Status Distribution */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Application Status</h2>
                <BarChart3 className="w-5 h-5 text-primary-600" />
              </div>
              {dashboardData?.applicationsByStatus ? (
                <div className="space-y-3">
                  {Object.entries(dashboardData.applicationsByStatus)
                    .filter(([_, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([status, count]) => (
                      <div key={status}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-neutral-600">
                            {statusLabels[status] || status}
                          </span>
                          <span className="font-medium text-neutral-900">{count}</span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${statusColors[status] || 'bg-neutral-300'} rounded-full transition-all`}
                            style={{ width: `${getStatusPercentage(status)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-neutral-500">No data available</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="p-2 rounded-lg bg-primary-100">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Manage Users</p>
                  <p className="text-sm text-neutral-500">Add or edit system users</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Role Permissions</p>
                  <p className="text-sm text-neutral-500">Configure access control</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Settings className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-900">System Settings</p>
                  <p className="text-sm text-neutral-500">Configure fee rates</p>
                </div>
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">System Health</h2>
              <Activity className="w-5 h-5 text-success-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-success-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success-700">API</span>
                </div>
                <p className="text-xs text-success-600">Operational</p>
              </div>

              <div className="p-4 bg-success-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success-700">Database</span>
                </div>
                <p className="text-xs text-success-600">Operational</p>
              </div>

              <div className="p-4 bg-success-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success-700">Storage</span>
                </div>
                <p className="text-xs text-success-600">Operational</p>
              </div>

              <div className="p-4 bg-success-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success-700">Email Service</span>
                </div>
                <p className="text-xs text-success-600">Operational</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="card p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900">Analytics Dashboard</h3>
          <p className="text-neutral-500 mt-1">
            Detailed analytics and reporting features coming soon.
          </p>
          <p className="text-sm text-neutral-400 mt-4">
            This will include charts for application trends, revenue analysis, and processing times.
          </p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Fee Configuration</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Base Fee (USD)</label>
                  <input type="number" className="input" defaultValue="500" disabled />
                </div>
                <div>
                  <label className="label">Per-Seat Rate (USD)</label>
                  <input type="number" className="input" defaultValue="5" disabled />
                </div>
                <div>
                  <label className="label">Per-Kg Rate (USD)</label>
                  <input type="number" className="input" defaultValue="0.01" disabled />
                </div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    Fee configuration is managed by system administrators. Contact support to make
                    changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Permit Validity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">One-Time Permit (days)</label>
                <input type="number" className="input" defaultValue="30" disabled />
              </div>
              <div>
                <label className="label">Blanket Permit (months)</label>
                <input type="number" className="input" defaultValue="12" disabled />
              </div>
              <div>
                <label className="label">Emergency Permit (days)</label>
                <input type="number" className="input" defaultValue="7" disabled />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notification Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" defaultChecked disabled />
                <span className="text-neutral-700">
                  Send email notifications for new applications
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" defaultChecked disabled />
                <span className="text-neutral-700">
                  Send email notifications for payment confirmations
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" defaultChecked disabled />
                <span className="text-neutral-700">
                  Send email reminders for expiring permits
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
