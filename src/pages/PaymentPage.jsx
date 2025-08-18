import React, { useState, useEffect, useMemo } from 'react';
import { getAllStudents } from '../services/studentService';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm'; // Kita akan buat komponen ini selanjutnya

const PaymentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk mengelola modal pembayaran
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fungsi untuk mengambil data siswa
  const fetchStudents = async () => {
    setLoading(true);
    const studentData = await getAllStudents();
    setStudents(studentData);
    setLoading(false);
  };

  // Mengambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fungsi untuk membuka modal dan menyimpan data siswa yang dipilih
  const handlePaymentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  // Fungsi yang dipanggil setelah pembayaran berhasil
  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    alert('Pembayaran berhasil ditambahkan!');
    fetchStudents(); // Ambil ulang data untuk refresh sisa pertemuan
  };

  // Logika untuk filter pencarian
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Memuat data member...</div>;
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pembayaran</h1>
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari nama member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Member</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Pertemuan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.nickname || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${student.remainingSessions > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {student.remainingSessions}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handlePaymentClick(student)}
                      className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Bayar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Pembayaran untuk ${selectedStudent?.name}`}
      >
        {selectedStudent && <PaymentForm student={selectedStudent} onSuccess={handlePaymentSuccess} />}
      </Modal>
    </>
  );
};

export default PaymentPage;