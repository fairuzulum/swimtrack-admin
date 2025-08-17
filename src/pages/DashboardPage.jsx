import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';
import StudentList from '../components/StudentList';
import Modal from '../components/Modal';
import AddStudentForm from '../components/AddStudentForm';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State ini berfungsi sebagai "saklar" untuk memberitahu StudentList agar memuat ulang datanya.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fungsi ini akan dipanggil oleh AddStudentForm saat registrasi berhasil.
  const handleRegisterSuccess = () => {
    setIsModalOpen(false); // 1. Tutup modal
    setRefreshTrigger(prev => prev + 1); // 2. Ubah nilai trigger untuk me-refresh list
    alert("Member baru berhasil didaftarkan!"); // 3. Beri notifikasi
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Login sebagai: {currentUser?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Daftarkan Member
          </button>
        </div>
        
        {/* Mengirim refreshTrigger sebagai prop ke StudentList */}
        <StudentList refreshTrigger={refreshTrigger} />
      </main>

      {/* Modal untuk form pendaftaran akan muncul di sini jika isModalOpen true */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Daftarkan Member Baru"
      >
        <AddStudentForm onSuccess={handleRegisterSuccess} />
      </Modal>
    </div>
  );
};

export default DashboardPage;