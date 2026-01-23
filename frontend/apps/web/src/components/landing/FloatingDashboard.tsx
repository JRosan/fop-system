import { FileCheck, DollarSign, Clock, Shield, AlertTriangle } from 'lucide-react';

export function FloatingDashboard() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main Dashboard Card */}
      <div className="glass-dark rounded-2xl p-6 animate-float shadow-2xl shadow-av-cyan-500/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Permit Dashboard</h3>
            <p className="text-av-cloud-400 text-sm">Real-time overview</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-av-cyan-500/20 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-av-cyan-400" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-av-navy-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">247</p>
            <p className="text-av-cloud-400 text-xs mt-1">Active Permits</p>
          </div>
          <div className="bg-av-navy-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-av-amber-400">18</p>
            <p className="text-av-cloud-400 text-xs mt-1">Pending Review</p>
          </div>
          <div className="bg-av-navy-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-av-cyan-400">$1.2M</p>
            <p className="text-av-cloud-400 text-xs mt-1">YTD Revenue</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-av-navy-800/30 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-4 h-4 text-success-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">BTA-2024-0847 Approved</p>
              <p className="text-av-cloud-500 text-xs">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-av-navy-800/30 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-av-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-av-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Payment Pending: $4,250</p>
              <p className="text-av-cloud-500 text-xs">15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Fee Calculation Card */}
      <div
        className="absolute -right-8 top-16 glass-dark rounded-xl p-4 animate-float-delayed shadow-xl shadow-av-navy-950/50"
        style={{ animationDelay: '1s' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-av-cyan-500/20 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-av-cyan-400" />
          </div>
          <span className="text-white text-sm font-medium">Fee Calculated</span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-av-cloud-400">Base Fee</span>
            <span className="text-white">$500.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-av-cloud-400">Seat Fee (180)</span>
            <span className="text-white">$1,800.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-av-cloud-400">Weight Fee</span>
            <span className="text-white">$1,200.00</span>
          </div>
          <div className="border-t border-av-navy-600 my-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-av-cyan-400">Total</span>
            <span className="text-av-cyan-400">$3,500.00</span>
          </div>
        </div>
      </div>

      {/* Floating Insurance Badge */}
      <div
        className="absolute -left-4 bottom-24 glass-dark rounded-xl p-3 animate-float-slow shadow-xl shadow-av-navy-950/50"
        style={{ animationDelay: '2s' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-success-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-success-400" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Insurance Verified</p>
            <p className="text-success-400 text-xs">$50M Coverage</p>
          </div>
        </div>
      </div>

      {/* Floating Alert */}
      <div
        className="absolute -right-12 bottom-8 glass-dark rounded-xl p-3 animate-float shadow-xl shadow-av-navy-950/50"
        style={{ animationDelay: '0.5s' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-av-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-3 h-3 text-av-amber-400" />
          </div>
          <span className="text-av-amber-400 text-xs font-medium">3 permits expiring</span>
        </div>
      </div>
    </div>
  );
}
