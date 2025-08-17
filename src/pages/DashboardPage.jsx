import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';
import StudentList from '../components/StudentList';
import Modal from '../components/Modal'; // Impor Modal
import AddStudentForm from '../components/AddStudentForm'; // Impor Form

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk me-refresh daftar siswa
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRegisterSuccess = () => {
    setIsModalOpen(false); // Tutup modal
    setRefreshTrigger(prev => prev + 1); // Picu refresh data di StudentList
    alert("Member baru berhasil didaftarkan!");
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
            className="px-5 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            + Daftarkan Member
          </button>
        </div>
        
        {/* Kirim refreshTrigger ke StudentList */}
        <StudentList key={refreshTrigger} />
      </main>

      {/* Modal untuk form pendaftaran */}
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