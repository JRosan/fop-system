import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PublicLayout } from './layouts/PublicLayout';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { NewApplication } from './pages/NewApplication';
import { ApplicationDetails } from './pages/ApplicationDetails';
import { Permits } from './pages/Permits';
import { Operators } from './pages/Operators';
import { FeeCalculator } from './pages/FeeCalculator';
import { ReviewerDashboard } from './pages/ReviewerDashboard';
import { FinanceDashboard } from './pages/FinanceDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PermitDetails } from './pages/PermitDetails';
import { VerifyPermit } from './pages/VerifyPermit';
import { Waivers } from './pages/Waivers';
import { AuditLogs } from './pages/AuditLogs';
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Compliance } from './pages/Compliance';
import { NotificationContainer } from './components/NotificationContainer';

export default function App() {
  return (
    <>
      <Routes>
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
        </Route>

        {/* Legacy URL Redirects for backward compatibility */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/applications" element={<Navigate to="/app/applications" replace />} />
        <Route path="/applications/new" element={<Navigate to="/app/applications/new" replace />} />
        <Route path="/applications/:id" element={<Navigate to="/app/applications/:id" replace />} />
        <Route path="/permits" element={<Navigate to="/app/permits" replace />} />
        <Route path="/permits/:id" element={<Navigate to="/app/permits/:id" replace />} />
        <Route path="/verify" element={<Navigate to="/app/verify" replace />} />
        <Route path="/operators" element={<Navigate to="/app/operators" replace />} />
        <Route path="/fee-calculator" element={<Navigate to="/app/fee-calculator" replace />} />
        <Route path="/review" element={<Navigate to="/app/review" replace />} />
        <Route path="/finance" element={<Navigate to="/app/finance" replace />} />
        <Route path="/waivers" element={<Navigate to="/app/waivers" replace />} />
        <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
        <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
      </Routes>
      <NotificationContainer />
    </>
  );
}
