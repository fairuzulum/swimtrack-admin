import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FinancialPage from './pages/FinancialPage';
import MainLayout from './components/MainLayout';
import AttendancePage from './pages/AttendancePage';
import StudentDetailPage from './pages/StudentDetailPage';
import PaymentPage from './pages/PaymentPage';
import BackupPage from './pages/BackupPage';
import SettingsPage from './pages/SettingsPage';
import ReportPage from './pages/ReportPage';

// Komponen untuk melindungi halaman yang butuh login
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Komponen untuk halaman publik (seperti login)
function PublicRoute({ children }) {
    const { currentUser } = useAuth();
    return !currentUser ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Login */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        
        {/* Halaman di dalam Dashboard (yang butuh login) */}
        <Route 
          path="/" 
          element={<ProtectedRoute><MainLayout /></ProtectedRoute>}
        >
          {/* Halaman default saat membuka "/" */}
          <Route index element={<DashboardPage />} /> 
          {/* Halaman Laporan Keuangan */}
          <Route path="financials" element={<FinancialPage />} />
          <Route path="payments" element={<PaymentPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="member/:id" element={<StudentDetailPage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;