import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Award,
  Building2,
  Calculator,
  ClipboardCheck,
  DollarSign,
  Settings,
  ShieldCheck,
  Receipt,
  History,
  Menu,
  X,
  Plane,
} from 'lucide-react';
import { useState } from 'react';
import { useTenantBranding } from './TenantThemeProvider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Review Queue', href: '/review', icon: ClipboardCheck },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Fee Waivers', href: '/waivers', icon: Receipt },
  { name: 'Permits', href: '/permits', icon: Award },
  { name: 'Verify Permit', href: '/verify', icon: ShieldCheck },
  { name: 'Operators', href: '/operators', icon: Building2 },
  { name: 'Fee Calculator', href: '/fee-calculator', icon: Calculator },
  { name: 'Audit Logs', href: '/audit', icon: History },
  { name: 'Admin', href: '/admin', icon: Settings },
];

function TenantLogo({ className }: { className?: string }) {
  const { logoUrl, code, primaryColor } = useTenantBranding();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${code} Logo`}
        className={className}
      />
    );
  }

  // Default logo icon with tenant primary color
  return (
    <div
      className={`flex items-center justify-center rounded-lg ${className}`}
      style={{ backgroundColor: primaryColor }}
    >
      <Plane className="w-5 h-5 text-white" />
    </div>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { name, code, isLoading } = useTenantBranding();

  // Display name: use code + "FOP System" format
  const displayName = isLoading ? 'FOP System' : `${code} FOP System`;
  const fullName = isLoading ? 'Civil Aviation Department' : name;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}
      >
        <div
          className="fixed inset-0 bg-neutral-900/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 h-16 border-b">
            <div className="flex items-center gap-2">
              <TenantLogo className="w-8 h-8" />
              <span className="text-lg font-semibold text-primary-600">
                {displayName}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-white border-r border-neutral-200">
          <div className="flex items-center gap-2 px-6 h-16 border-b">
            <TenantLogo className="w-8 h-8" />
            <span className="text-lg font-semibold text-primary-600">
              {displayName}
            </span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t">
            <p className="text-xs text-neutral-500">
              {fullName}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-4 px-4 h-16 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <TenantLogo className="w-7 h-7" />
            <span className="text-lg font-semibold text-primary-600">
              {displayName}
            </span>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
