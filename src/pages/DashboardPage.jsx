import React, { useState } from 'react';
import StudentList from '../components/StudentList';
import Modal from '../components/Modal';
import AddStudentForm from '../components/AddStudentForm';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRegisterSuccess = () => {
    setIsModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
    alert("Member baru berhasil didaftarkan!");
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Member</h1>
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
      
      <StudentList refreshTrigger={refreshTrigger} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Daftarkan Member Baru"
      >
        <AddStudentForm onSuccess={handleRegisterSuccess} />
      </Modal>
    </>
  );
};

export default DashboardPage;