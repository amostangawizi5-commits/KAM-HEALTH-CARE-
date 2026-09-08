import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import LaboratoryDashboard from './pages/LaboratoryDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import CashierDashboard from './pages/CashierDashboard';
import PatientRegistration from './pages/PatientRegistration';
import AdminUserRegistration from './pages/AdminUserRegistration';
import CreateAccountPage from './pages/CreateAccountPage';
import AdminSetupPage from './pages/AdminSetupPage';
import NotFound from './pages/NotFound';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  const role = String(user?.role || '').trim().toUpperCase();

  if (loading) {
    return <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>Loading dashboard...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-setup" element={<AdminSetupPage />} />
          <Route
            path="/create-account"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateAccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'CONSULTANT', 'DOCTOR', 'LABORATORY', 'PHARMACIST', 'CASHIER']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                <PatientRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/register-user"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUserRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reception"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CONSULTANT']}>
                <ConsultantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laboratory"
            element={
              <ProtectedRoute allowedRoles={['LABORATORY', 'ADMIN']}>
                <LaboratoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashier"
            element={
              <ProtectedRoute allowedRoles={['CASHIER', 'ADMIN']}>
                <CashierDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
