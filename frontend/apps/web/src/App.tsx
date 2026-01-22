import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
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
import { NotificationContainer } from './components/NotificationContainer';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
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
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <NotificationContainer />
    </>
  );
}
