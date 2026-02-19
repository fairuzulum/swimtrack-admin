import React, { useState, useEffect, useMemo } from 'react';
import { getAllStudents, getPaymentsByDateRange } from '../services/studentService'; // Tambahkan import
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';

const PaymentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State baru untuk filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredPayments, setFilteredPayments] = useState(null); // null artinya mode list siswa biasa
  const [isFiltering, setIsFiltering] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    const studentData = await getAllStudents();
    setStudents(studentData);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fungsi untuk memproses filter
  const handleApplyFilter = async () => {
    if (!startDate || !endDate) {
      alert("Pilih tanggal mulai dan akhir!");
      return;
    }
    setIsFiltering(true);
    try {
      const results = await getPaymentsByDateRange(new Date(startDate), new Date(endDate));
      setFilteredPayments(results);
    } catch (error) {
      alert("Gagal mengambil data filter");
    } finally {
      setIsFiltering(false);
    }
  };

  // Shortcut Filter Hari Ini
  const handleFilterToday = async () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setStartDate(dateStr);
    setEndDate(dateStr);
    
    setIsFiltering(true);
    try {
      const results = await getPaymentsByDateRange(today, today);
      setFilteredPayments(results);
    } catch (error) {
      alert("Gagal mengambil data hari ini");
    } finally {
      setIsFiltering(false);
    }
  };

  const resetFilter = () => {
    setFilteredPayments(null);
    setStartDate('');
    setEndDate('');
  };

  const handlePaymentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    alert('Pembayaran berhasil ditambahkan!');
    if (filteredPayments) {
      handleApplyFilter(); // Refresh list filter jika sedang dalam mode filter
    }
    fetchStudents();
  };

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
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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

        {/* Filter Section Baru */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap items-end gap-4 border border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleApplyFilter}
              disabled={isFiltering}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isFiltering ? 'Loading...' : 'Filter'}
            </button>
            <button 
              onClick={handleFilterToday}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600"
            >
              Hari Ini
            </button>
            {filteredPayments && (
              <button 
                onClick={resetFilter}
                className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {filteredPayments ? (
                // Header untuk mode Filter Riwayat
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Member</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sesi Tambah</th>
                </tr>
              ) : (
                // Header untuk mode Default (Daftar Siswa)
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Member</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Pertemuan</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments ? (
                // Render hasil filter riwayat pembayaran
                filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.formattedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{p.studentName}</div>
                        <div className="text-sm text-gray-500">{p.studentNickname || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-green-600">
                        Rp {p.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        +{p.sessionsAdded} Sesi
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Tidak ada pembayaran pada periode ini.</td>
                  </tr>
                )
              ) : (
                // Render daftar siswa biasa
                filteredStudents.map((student) => (
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
                ))
              )}
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