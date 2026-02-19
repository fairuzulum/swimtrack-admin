import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { getAllStudents, getAllPayments, getPaymentsByDateRange } from '../services/studentService';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';

const PaymentPage = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const studentData = await getAllStudents();
        setStudents(studentData);

        const allPayments = await getAllPayments();
        setPayments(allPayments);
      } catch (error) {
        console.error('Gagal mengambil data awal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleApplyFilter = async () => {
    if (!startDate || !endDate) {
      alert('Pilih tanggal mulai dan akhir!');
      return;
    }
    setIsFiltering(true);
    try {
      const results = await getPaymentsByDateRange(new Date(startDate), new Date(endDate));
      setPayments(results);
    } catch (error) {
      alert('Gagal mengambil data filter');
    } finally {
      setIsFiltering(false);
    }
  };

  const handleFilterToday = async () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setStartDate(dateStr);
    setEndDate(dateStr);

    setIsFiltering(true);
    try {
      const results = await getPaymentsByDateRange(today, today);
      setPayments(results);
    } catch (error) {
      alert('Gagal mengambil data hari ini');
    } finally {
      setIsFiltering(false);
    }
  };

  const resetFilter = async () => {
    setStartDate('');
    setEndDate('');
    setIsFiltering(true);
    try {
      const allPayments = await getAllPayments();
      setPayments(allPayments);
    } catch (error) {
      alert('Gagal mereset filter');
    } finally {
      setIsFiltering(false);
    }
  };

  const handlePaymentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsModalOpen(false);
    alert('Pembayaran berhasil ditambahkan!');
    if (startDate && endDate) {
      await handleApplyFilter();
    } else {
      const allPayments = await getAllPayments();
      setPayments(allPayments);
    }
    const studentData = await getAllStudents();
    setStudents(studentData);
  };

  const handleExportExcel = () => {
    if (payments.length === 0) return;

    const worksheetData = payments.map((p) => ({
      Waktu: p.formattedDate,
      'Nama Member': p.studentName,
      'Nama Panggilan': p.studentNickname || '',
      'Jumlah (Rp)': p.amount,
      'Sesi Ditambah': p.sessionsAdded,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pembayaran');
    const fileName =
      startDate && endDate
        ? `pembayaran_${startDate}_sd_${endDate}.xlsx`
        : `semua_pembayaran.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Filter berdasarkan pencarian (client-side)
  const displayedPayments = useMemo(() => {
    if (!searchTerm) return payments;
    return payments.filter(
      (p) =>
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.studentNickname && p.studentNickname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [payments, searchTerm]);

  // Hitung total uang dan jumlah transaksi (baris)
  const totalAmount = displayedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = displayedPayments.length; // <-- ini jumlah baris

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Memuat data pembayaran...</div>;
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Pembayaran</h1>
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari nama member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Section */}
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
            {(startDate || endDate) && (
              <button
                onClick={resetFilter}
                className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleExportExcel}
              disabled={payments.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-green-300"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Tabel Riwayat Pembayaran */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Member
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesi Tambah
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedPayments.length > 0 ? (
                displayedPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.formattedDate}
                    </td>
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
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    {searchTerm
                      ? 'Tidak ada pembayaran yang cocok dengan pencarian.'
                      : 'Belum ada data pembayaran.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ringkasan: Total Uang dan Jumlah Transaksi */}
        {displayedPayments.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="font-semibold text-gray-700">Total Pembayaran:</span>
              <span className="text-xl font-bold text-green-600 ml-2">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Jumlah Transaksi:</span>
              <span className="text-xl font-bold text-blue-600 ml-2">
                {totalTransactions} transaksi
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? `Pembayaran untuk ${selectedStudent.name}` : 'Tambah Pembayaran'}
      >
        {selectedStudent ? (
          <PaymentForm student={selectedStudent} onSuccess={handlePaymentSuccess} />
        ) : (
          <div className="p-4 text-center text-gray-500">
            Pilih siswa terlebih dahulu (fitur pemilihan siswa menyusul)
          </div>
        )}
      </Modal>
    </>
  );
};

export default PaymentPage;