import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from './LogoutButton';
import AppLogo from '../assets/logo_renang.png';

const MainLayout = () => {
  const { currentUser } = useAuth();

  const navLinkClasses = ({ isActive }) => 
    `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white shadow-lg">
        <div className="flex items-center justify-center h-20 border-b">
          <img src={AppLogo} alt="Logo" className="h-10 w-10" />
          <span className="ml-3 text-xl font-bold text-gray-800">Admin FSS</span>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/" className={navLinkClasses}>
            <span>Daftar Member</span>
          </NavLink>
           <NavLink to="/attendance" className={navLinkClasses}>
            <span>Absen Kehadiran</span>
          </NavLink>
          <NavLink to="/financials" className={navLinkClasses}>
            <span>Laporan Keuangan</span>
          </NavLink>
        </nav>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header di dalam konten */}
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Login sebagai: <strong>{currentUser?.email}</strong>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Outlet ini adalah tempat di mana konten halaman (Dashboard/Financial) akan ditampilkan */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;