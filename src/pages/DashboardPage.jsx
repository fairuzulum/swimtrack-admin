import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';
import StudentList from '../components/StudentList'; // Impor komponen baru

const DashboardPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Tetap Sama */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Login sebagai: {currentUser?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>
      
      {/* Konten Utama Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Di sinilah kita menampilkan komponen daftar siswa */}
        <StudentList />
      </main>
    </div>
  );
};

export default DashboardPage;