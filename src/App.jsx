import React from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { currentUser } = useAuth(); // Menggunakan hook untuk mengecek status login

  // Jika currentUser ada (tidak null), berarti pengguna sudah login.
  // Jika tidak, tampilkan halaman login.
  return currentUser ? <DashboardPage /> : <LoginPage />;
}

export default App;