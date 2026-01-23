import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PublicLayout } from './layouts/PublicLayout';
import { ScrollToTop } from './components/ScrollToTop';
import { NotificationContainer } from './components/NotificationContainer';

// Redirect component that preserves route parameters
function RedirectWithParams({ to }: { to: string }) {
  const params = useParams();
  let path = to;
  // Replace :param placeholders with actual values
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      path = path.replace(`:${key}`, value);
    }
  });
  return <Navigate to={path} replace />;
}

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bvi-sand-50 dark:bg-bvi-atlantic-900">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto border-4 border-bvi-turquoise-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-bvi-granite-500 dark:text-bvi-granite-400">Loading...</p>
      </div>
    </div>
  );
}

// Lazy load pages for better code splitting
// Public pages
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Features = lazy(() => import('./pages/Features').then(m => ({ default: m.Features })));
const Pricing = lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Compliance = lazy(() => import('./pages/Compliance').then(m => ({ default: m.Compliance })));

// Auth pages
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));

// App pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Applications = lazy(() => import('./pages/Applications').then(m => ({ default: m.Applications })));
const NewApplication = lazy(() => import('./pages/NewApplication').then(m => ({ default: m.NewApplication })));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails').then(m => ({ default: m.ApplicationDetails })));
const Permits = lazy(() => import('./pages/Permits').then(m => ({ default: m.Permits })));
const PermitDetails = lazy(() => import('./pages/PermitDetails').then(m => ({ default: m.PermitDetails })));
const VerifyPermit = lazy(() => import('./pages/VerifyPermit').then(m => ({ default: m.VerifyPermit })));
const Operators = lazy(() => import('./pages/Operators').then(m => ({ default: m.Operators })));
const FeeCalculator = lazy(() => import('./pages/FeeCalculator').then(m => ({ default: m.FeeCalculator })));

// Role-specific dashboards
const ReviewerDashboard = lazy(() => import('./pages/ReviewerDashboard').then(m => ({ default: m.ReviewerDashboard })));
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Admin pages
const UserManagement = lazy(() => import('./pages/UserManagement').then(m => ({ default: m.UserManagement })));
const SystemSettings = lazy(() => import('./pages/SystemSettings').then(m => ({ default: m.SystemSettings })));

// Other pages
const Waivers = lazy(() => import('./pages/Waivers').then(m => ({ default: m.Waivers })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then(m => ({ default: m.AuditLogs })));
const Subscription = lazy(() => import('./pages/Subscription').then(m => ({ default: m.Subscription })));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Routes (no layout) */}
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public Marketing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/compliance" element={<Compliance />} />
          </Route>

          {/* Authenticated App Routes */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/new" element={<NewApplication />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="permits" element={<Permits />} />
            <Route path="permits/:id" element={<PermitDetails />} />
            <Route path="verify" element={<VerifyPermit />} />
            <Route path="operators" element={<Operators />} />
            <Route path="fee-calculator" element={<FeeCalculator />} />
            <Route path="review" element={<ReviewerDashboard />} />
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="waivers" element={<Waivers />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/settings" element={<SystemSettings />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          {/* Legacy URL Redirects for backward compatibility */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/applications" element={<Navigate to="/app/applications" replace />} />
          <Route path="/applications/new" element={<Navigate to="/app/applications/new" replace />} />
          <Route path="/applications/:id" element={<RedirectWithParams to="/app/applications/:id" />} />
          <Route path="/permits" element={<Navigate to="/app/permits" replace />} />
          <Route path="/permits/:id" element={<RedirectWithParams to="/app/permits/:id" />} />
          <Route path="/verify" element={<Navigate to="/app/verify" replace />} />
          <Route path="/operators" element={<Navigate to="/app/operators" replace />} />
          <Route path="/fee-calculator" element={<Navigate to="/app/fee-calculator" replace />} />
          <Route path="/review" element={<Navigate to="/app/review" replace />} />
          <Route path="/finance" element={<Navigate to="/app/finance" replace />} />
          <Route path="/waivers" element={<Navigate to="/app/waivers" replace />} />
          <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
          <Route path="/subscription" element={<Navigate to="/app/subscription" replace />} />
        </Routes>
      </Suspense>
      <NotificationContainer />
    </>
  );
}
