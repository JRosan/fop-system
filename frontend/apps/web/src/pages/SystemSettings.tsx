import { useState, useEffect } from 'react';
import {
  Settings, DollarSign, Mail, CreditCard, Database,
  Check, X, RefreshCw, Save, AlertTriangle
} from 'lucide-react';
import { apiClient, stripeApi } from '@fop/api';
import { useNotificationStore } from '@fop/core';

interface FeeConfiguration {
  id: string;
  applicationType: string;
  baseFee: number;
  perSeatFee: number;
  perKgFee: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

interface SystemStatus {
  database: boolean;
  stripe: boolean;
  email: boolean;
  storage: boolean;
}

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'fees' | 'integrations' | 'email'>('fees');
  const [feeConfigs, setFeeConfigs] = useState<FeeConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: true,
    stripe: false,
    email: false,
    storage: true,
  });
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load fee configurations
      const { data: fees } = await apiClient.get<FeeConfiguration[]>('/fee-configurations');
      setFeeConfigs(fees);

      // Check Stripe status
      try {
        const stripeConfig = await stripeApi.getConfig();
        setSystemStatus(prev => ({ ...prev, stripe: stripeConfig.enabled }));
      } catch {
        setSystemStatus(prev => ({ ...prev, stripe: false }));
      }

    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async (config: FeeConfiguration) => {
    try {
      setSaving(true);
      await apiClient.put(`/fee-configurations/${config.id}`, config);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Fee configuration updated',
      });
      await loadData();
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update fee configuration',
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'fees', label: 'Fee Configuration', icon: DollarSign },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'email', label: 'Email Settings', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-bvi-atlantic-600 dark:text-white flex items-center gap-3">
          <Settings className="w-7 h-7" />
          System Settings
        </h1>
        <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mt-1">
          Configure system parameters and integrations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-bvi-sand-200 dark:border-bvi-atlantic-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-bvi-turquoise-500 text-bvi-turquoise-600 dark:text-bvi-turquoise-400'
                : 'border-transparent text-bvi-granite-500 hover:text-bvi-atlantic-600 dark:text-bvi-granite-400 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-12 text-center">
          <div className="w-10 h-10 mx-auto border-4 border-bvi-turquoise-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Fee Configuration Tab */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 overflow-hidden">
                <div className="p-4 border-b border-bvi-sand-200 dark:border-bvi-atlantic-700 flex justify-between items-center">
                  <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white">
                    Application Fee Structure
                  </h3>
                  <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">
                    Formula: (Base + Seats × PerSeat + Weight × PerKg) × Multiplier
                  </p>
                </div>
                <table className="w-full">
                  <thead className="bg-bvi-sand-50 dark:bg-bvi-atlantic-900">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Type</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Base Fee</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Per Seat</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Per Kg</th>
                      <th className="text-center px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Status</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bvi-sand-200 dark:divide-bvi-atlantic-700">
                    {feeConfigs.map((config) => (
                      <tr key={config.id} className="hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700">
                        <td className="px-6 py-4">
                          <span className="font-medium text-bvi-atlantic-600 dark:text-white">
                            {config.applicationType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-bvi-atlantic-600 dark:text-white">
                          ${config.baseFee.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-bvi-atlantic-600 dark:text-white">
                          ${config.perSeatFee.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-bvi-atlantic-600 dark:text-white">
                          ${config.perKgFee.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            config.isActive
                              ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                              : 'bg-bvi-granite-100 text-bvi-granite-600 dark:bg-bvi-granite-800 dark:text-bvi-granite-400'
                          }`}>
                            {config.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {config.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleUpdateFee(config)}
                            disabled={saving}
                            className="p-2 text-bvi-turquoise-600 hover:bg-bvi-turquoise-50 dark:hover:bg-bvi-turquoise-900/20 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Multipliers */}
              <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-6">
                <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white mb-4">
                  Type Multipliers
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 bg-bvi-sand-50 dark:bg-bvi-atlantic-900 rounded-lg">
                    <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">One-Time Permit</p>
                    <p className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white">1.0x</p>
                  </div>
                  <div className="p-4 bg-bvi-sand-50 dark:bg-bvi-atlantic-900 rounded-lg">
                    <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Blanket Permit</p>
                    <p className="text-2xl font-bold text-bvi-turquoise-600">2.5x</p>
                  </div>
                  <div className="p-4 bg-bvi-sand-50 dark:bg-bvi-atlantic-900 rounded-lg">
                    <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Emergency Permit</p>
                    <p className="text-2xl font-bold text-bvi-gold-600">0.5x</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              {/* Database */}
              <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      systemStatus.database ? 'bg-success-100 dark:bg-success-900/30' : 'bg-error-100 dark:bg-error-900/30'
                    }`}>
                      <Database className={`w-6 h-6 ${systemStatus.database ? 'text-success-600' : 'text-error-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white">Database</h3>
                      <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">SQL Server Connection</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    systemStatus.database
                      ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                      : 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                  }`}>
                    {systemStatus.database ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Stripe */}
              <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      systemStatus.stripe ? 'bg-success-100 dark:bg-success-900/30' : 'bg-warning-100 dark:bg-warning-900/30'
                    }`}>
                      <CreditCard className={`w-6 h-6 ${systemStatus.stripe ? 'text-success-600' : 'text-warning-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white">Stripe Payments</h3>
                      <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Payment Processing</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    systemStatus.stripe
                      ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                      : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                  }`}>
                    {systemStatus.stripe ? 'Enabled' : 'Not Configured'}
                  </span>
                </div>
                {!systemStatus.stripe && (
                  <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0" />
                    <p className="text-sm text-warning-700 dark:text-warning-400">
                      Stripe is not configured. Payment processing is in mock mode. Add your Stripe API keys to enable real payments.
                    </p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      systemStatus.email ? 'bg-success-100 dark:bg-success-900/30' : 'bg-warning-100 dark:bg-warning-900/30'
                    }`}>
                      <Mail className={`w-6 h-6 ${systemStatus.email ? 'text-success-600' : 'text-warning-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white">SendGrid Email</h3>
                      <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Email Notifications</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    systemStatus.email
                      ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                      : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                  }`}>
                    {systemStatus.email ? 'Enabled' : 'Logging Only'}
                  </span>
                </div>
              </div>

              {/* Storage */}
              <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      systemStatus.storage ? 'bg-success-100 dark:bg-success-900/30' : 'bg-error-100 dark:bg-error-900/30'
                    }`}>
                      <Database className={`w-6 h-6 ${systemStatus.storage ? 'text-success-600' : 'text-error-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white">Azure Blob Storage</h3>
                      <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Document Storage</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    systemStatus.storage
                      ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                      : 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                  }`}>
                    {systemStatus.storage ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 text-bvi-turquoise-600 hover:bg-bvi-turquoise-50 dark:hover:bg-bvi-turquoise-900/20 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === 'email' && (
            <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-6">
              <h3 className="font-semibold text-bvi-atlantic-600 dark:text-white mb-4">
                Email Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    value="noreply@bvicad.gov.vg"
                    disabled
                    className="w-full px-4 py-2 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-bvi-sand-50 dark:bg-bvi-atlantic-900 text-bvi-granite-500 dark:text-bvi-granite-400"
                  />
                  <p className="text-xs text-bvi-granite-400 mt-1">Configured in appsettings.json</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bvi-granite-600 dark:text-bvi-granite-300 mb-2">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value="BVI Civil Aviation Department"
                    disabled
                    className="w-full px-4 py-2 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-bvi-sand-50 dark:bg-bvi-atlantic-900 text-bvi-granite-500 dark:text-bvi-granite-400"
                  />
                </div>
                <div className="pt-4 border-t border-bvi-sand-200 dark:border-bvi-atlantic-700">
                  <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">
                    Email templates are configured in the backend. Contact your system administrator to modify email content.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
