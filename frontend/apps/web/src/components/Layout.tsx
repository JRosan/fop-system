import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  User,
  HelpCircle,
  Bell,
  Search,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenantBranding } from './TenantThemeProvider';
import { useAuthStore } from '@fop/core';
import { dashboardApi } from '@fop/api';
import type { UserRole } from '@fop/types';

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
  badgeKey?: 'pendingReview' | 'pendingPayments' | 'pendingWaivers';
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navigationGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Applications', href: '/applications', icon: FileText },
      { name: 'Review Queue', href: '/review', icon: ClipboardCheck, roles: ['REVIEWER', 'APPROVER', 'ADMIN'], badgeKey: 'pendingReview' },
      { name: 'Permits', href: '/permits', icon: Award },
      { name: 'Verify Permit', href: '/verify', icon: ShieldCheck },
      { name: 'Operators', href: '/operators', icon: Building2 },
    ],
  },
  {
    title: 'Finance',
    items: [
      { name: 'Finance', href: '/finance', icon: DollarSign, roles: ['FINANCE_OFFICER', 'ADMIN'], badgeKey: 'pendingPayments' },
      { name: 'Fee Waivers', href: '/waivers', icon: Receipt, roles: ['FINANCE_OFFICER', 'ADMIN'], badgeKey: 'pendingWaivers' },
      { name: 'Fee Calculator', href: '/fee-calculator', icon: Calculator },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Audit Logs', href: '/audit', icon: History, roles: ['ADMIN'] },
      { name: 'Admin', href: '/admin', icon: Settings, roles: ['ADMIN'] },
    ],
  },
];

function TenantLogo({ className, variant = 'light' }: { className?: string; variant?: 'light' | 'dark' }) {
  const { logoUrl, code } = useTenantBranding();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${code} Logo`}
        className={className}
      />
    );
  }

  // Default logo icon with BVI Sovereign colors
  return (
    <div
      className={`flex items-center justify-center rounded-xl ${className} ${
        variant === 'dark'
          ? 'bg-bvi-turquoise-500/20 border border-bvi-turquoise-500/30'
          : 'bg-bvi-atlantic-600'
      }`}
    >
      <Plane className={`w-5 h-5 ${variant === 'dark' ? 'text-bvi-turquoise-400' : 'text-white'}`} />
    </div>
  );
}

function NavBadge({ count }: { count?: number }) {
  if (!count || count === 0) return null;
  return (
    <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-bvi-turquoise-500 text-white text-xs font-medium flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const { name, code, isLoading } = useTenantBranding();
  const { user, logout, hasAnyRole } = useAuthStore();

  const fullName = isLoading ? 'Civil Aviation Department' : name;
  const userName = user?.displayName || user?.firstName || 'User';
  const userRoles = user?.roles || [];

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Persist and apply dark mode
  useEffect(() => {
    localStorage.setItem('dark-mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch badge counts for reviewer dashboard
  const { data: reviewerData } = useQuery({
    queryKey: ['dashboard', 'reviewer', 'badges'],
    queryFn: () => dashboardApi.getReviewerDashboard(),
    enabled: hasAnyRole(['REVIEWER', 'APPROVER', 'ADMIN']),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });

  // Fetch badge counts for finance dashboard
  const { data: financeData } = useQuery({
    queryKey: ['dashboard', 'finance', 'badges'],
    queryFn: () => dashboardApi.getFinanceDashboard(),
    enabled: hasAnyRole(['FINANCE_OFFICER', 'ADMIN']),
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const badgeCounts = {
    pendingReview: reviewerData?.pendingReview || 0,
    pendingPayments: financeData?.pendingPayments || 0,
    pendingWaivers: financeData?.pendingWaivers || 0,
  };

  // Filter navigation items based on user roles and search query
  // In development (no user), show all items; otherwise filter by role
  const isDev = !user || userRoles.length === 0;

  const getVisibleItems = (items: NavItem[]) => {
    return items.filter((item) => {
      // Role check - skip in dev mode or if user has required role
      if (item.roles && !isDev && !item.roles.some((role) => userRoles.includes(role))) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  };

  // Filter groups to only show those with visible items
  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: getVisibleItems(group.items),
    }))
    .filter((group) => group.items.length > 0);

  // All visible items for search results
  const allVisibleItems = visibleGroups.flatMap((g) => g.items);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bvi-sand-50 dark:bg-bvi-atlantic-950 transition-colors">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}
      >
        <div
          className="fixed inset-0 bg-bvi-atlantic-900/40 dark:bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-bvi-atlantic-900 shadow-2xl flex flex-col transition-colors">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-bvi-sand-200 dark:border-bvi-granite-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <TenantLogo className="w-10 h-10" />
              <div className="flex flex-col">
                <span className="font-display text-base">
                  <span className="font-bold text-bvi-atlantic-600 dark:text-white">{code || 'BVI'}</span>
                  <span className="text-bvi-granite-400 dark:text-bvi-granite-300 font-normal"> System</span>
                </span>
                <span className="text-[10px] text-bvi-turquoise-500 font-medium">
                  Foreign Operator Permit
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-granite-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto sidebar-scroll">
            {visibleGroups.map((group, groupIndex) => (
              <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
                <p className="px-4 mb-2 text-xs font-semibold text-bvi-granite-400 dark:text-bvi-granite-500 uppercase tracking-wider">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                          isActive
                            ? 'bg-bvi-atlantic-600 text-white shadow-md'
                            : 'text-bvi-granite-600 dark:text-bvi-granite-300 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white'
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                      {item.badgeKey && (
                        <NavBadge count={badgeCounts[item.badgeKey]} />
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile Footer */}
          <div className="flex-shrink-0 p-4 border-t border-bvi-sand-200 dark:border-bvi-granite-700">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-bvi-sand-100 dark:bg-bvi-atlantic-800 mb-2">
              <div className="w-9 h-9 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-bvi-atlantic-600 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-bvi-granite-400 truncate">{fullName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/help"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors text-sm"
                onClick={() => setSidebarOpen(false)}
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </a>
              <button
                onClick={handleSignOut}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className="flex flex-col h-full bg-white dark:bg-bvi-atlantic-900 border-r border-bvi-sand-200 dark:border-bvi-granite-700 transition-colors">
          {/* Desktop Header */}
          <div className={`flex items-center h-20 border-b border-bvi-sand-200 dark:border-bvi-granite-700 dark:bg-bvi-atlantic-800 ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
              <TenantLogo className="w-11 h-11 flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-display text-lg">
                    <span className="font-bold text-bvi-atlantic-600 dark:text-white">{code || 'BVI'}</span>
                    <span className="text-bvi-granite-400 dark:text-bvi-granite-300 font-normal"> System</span>
                  </span>
                  <span className="text-[11px] text-bvi-turquoise-500 font-medium">
                    Foreign Operator Permit
                  </span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-700 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors"
                  title={darkMode ? 'Light mode' : 'Dark mode'}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-2 rounded-lg text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-700 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          {!sidebarCollapsed && (
            <div className="px-4 py-3 border-b border-bvi-sand-100 dark:border-bvi-granite-700">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-bvi-sand-50 dark:bg-bvi-atlantic-800 border transition-colors ${searchFocused ? 'border-bvi-turquoise-400 ring-2 ring-bvi-turquoise-100 dark:ring-bvi-turquoise-900' : 'border-bvi-sand-200 dark:border-bvi-granite-600'}`}>
                <Search className="w-4 h-4 text-bvi-granite-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 bg-transparent text-sm text-bvi-granite-600 dark:text-bvi-granite-200 placeholder-bvi-granite-400 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 rounded hover:bg-bvi-sand-200 dark:hover:bg-bvi-atlantic-700 transition-colors"
                  >
                    <X className="w-3 h-3 text-bvi-granite-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className={`flex-1 overflow-y-auto sidebar-scroll ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {searchQuery ? (
              // Flat list when searching
              <div className="space-y-1">
                {allVisibleItems.length > 0 ? (
                  allVisibleItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                          isActive
                            ? 'bg-bvi-atlantic-600 text-white shadow-md'
                            : 'text-bvi-granite-600 hover:bg-bvi-sand-100 hover:text-bvi-atlantic-600'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                      {item.badgeKey && (
                        <NavBadge count={badgeCounts[item.badgeKey]} />
                      )}
                    </NavLink>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-bvi-granite-400">No results found</p>
                )}
              </div>
            ) : (
              // Grouped navigation when not searching
              visibleGroups.map((group, groupIndex) => (
                <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
                  {!sidebarCollapsed && (
                    <p className="px-4 mb-2 text-xs font-semibold text-bvi-granite-400 dark:text-bvi-granite-500 uppercase tracking-wider">
                      {group.title}
                    </p>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        title={sidebarCollapsed ? item.name : undefined}
                        className={({ isActive }) =>
                          `group flex items-center rounded-xl font-medium transition-all ${
                            sidebarCollapsed
                              ? `justify-center p-3 ${isActive ? 'bg-bvi-atlantic-600 text-white shadow-md' : 'text-bvi-granite-600 dark:text-bvi-granite-300 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white'}`
                              : `gap-3 px-4 py-2.5 ${isActive ? 'bg-bvi-atlantic-600 text-white shadow-md' : 'text-bvi-granite-600 dark:text-bvi-granite-300 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white'}`
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {item.badgeKey && (
                              <NavBadge count={badgeCounts[item.badgeKey]} />
                            )}
                          </>
                        )}
                        {sidebarCollapsed && item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-bvi-turquoise-500 rounded-full" />
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))
            )}
          </nav>

          {/* Expand Button (when collapsed) */}
          {sidebarCollapsed && (
            <div className="px-2 py-2 border-b border-bvi-sand-100 dark:border-bvi-granite-700">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-3 rounded-xl text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-700 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors flex items-center justify-center"
                title="Expand sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Desktop Footer */}
          <div className={`border-t border-bvi-sand-200 dark:border-bvi-granite-700 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {sidebarCollapsed ? (
              // Collapsed footer - icon buttons only
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors"
                  title={darkMode ? 'Light mode' : 'Dark mode'}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center" title={userName}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <a
                  href="/help"
                  title="Help"
                  className="p-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </a>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // Expanded footer
              <>
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-bvi-sand-100 dark:bg-bvi-atlantic-800 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-bvi-atlantic-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bvi-atlantic-600 dark:text-white truncate">{userName}</p>
                    <p className="text-xs text-bvi-granite-400 truncate">{fullName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href="/help"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors text-sm"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 hover:text-bvi-atlantic-600 dark:hover:text-white transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-white dark:bg-bvi-atlantic-900 border-b border-bvi-sand-200 dark:border-bvi-granite-700 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <TenantLogo className="w-9 h-9" />
              <div className="flex flex-col">
                <span className="font-display text-base">
                  <span className="font-bold text-bvi-atlantic-600 dark:text-white">{code || 'BVI'}</span>
                  <span className="text-bvi-granite-400 dark:text-bvi-granite-300 font-normal"> System</span>
                </span>
                <span className="text-[10px] text-bvi-turquoise-500 font-medium">
                  Foreign Operator Permit
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative p-2 rounded-lg text-bvi-granite-500 dark:text-bvi-granite-400 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-800 transition-colors">
              <Bell className="w-5 h-5" />
              {(badgeCounts.pendingReview + badgeCounts.pendingPayments + badgeCounts.pendingWaivers) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-bvi-turquoise-500 rounded-full" />
              )}
            </button>
            <div className="w-8 h-8 rounded-lg bg-bvi-atlantic-100 dark:bg-bvi-atlantic-700 flex items-center justify-center">
              <User className="w-4 h-4 text-bvi-atlantic-600 dark:text-white" />
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
