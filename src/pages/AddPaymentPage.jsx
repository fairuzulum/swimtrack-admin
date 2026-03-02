import React, { useState, useEffect, useMemo } from 'react';
import { getAllStudents } from '../services/studentService';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';

const AddPaymentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await getAllStudents();
        setStudents(data);
      } catch (error) {
        console.error('Gagal mengambil data siswa:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handlePaymentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    alert(`Pembayaran untuk ${selectedStudent.name} berhasil!`);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nickname && s.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm]);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data siswa...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Pilih Siswa untuk Pembayaran</h1>
        <input
          type="text"
          placeholder="Cari nama atau panggilan..."
          className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-bold text-gray-800">{student.name}</p>
              <p className="text-sm text-gray-500">{student.nickname || '-'}</p>
              <p className="text-xs text-blue-600 font-semibold">Sisa Sesi: {student.remainingSessions || 0}</p>
            </div>
            <button
              onClick={() => handlePaymentClick(student)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Bayar
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? `Input Pembayaran: ${selectedStudent.name}` : ''}
      >
        {selectedStudent && (
          <PaymentForm student={selectedStudent} onSuccess={handlePaymentSuccess} />
        )}
      </Modal>
    </div>
  );
};

export default AddPaymentPage;