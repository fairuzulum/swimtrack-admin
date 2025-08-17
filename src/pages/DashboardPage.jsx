import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';

const DashboardPage = () => {
  const { currentUser } = useAuth(); // Mengambil data user yang sedang login

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-500">Selamat datang, {currentUser?.email}</p>
        </div>
        <LogoutButton />
      </header>

      {/* Konten dashboard akan kita tambahkan di tahap berikutnya */}
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold">Konten Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Halaman untuk menampilkan data siswa, keuangan, dan fitur lainnya akan
          dibuat di sini pada tahap selanjutnya.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;