import React, { useState, useEffect, useMemo } from 'react';
import { getStudentClassStats } from '../services/studentService';
import { CLASS_CONFIG } from '../utils/classUtils';
import Modal from '../components/Modal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ClassReportPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('ALL');
  const [period, setPeriod] = useState('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk date picker
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRangeApplied, setDateRangeApplied] = useState(false);

  // Class legend dengan jadwal lengkap
  const classLegend = [
    { id: 'A', day: 'Sabtu', time: '08.00 - 09.30', desc: 'Sabtu Pagi' },
    { id: 'B', day: 'Sabtu', time: '09.30 - 11.00', desc: 'Sabtu Pagi' },
    { id: 'C', day: 'Sabtu', time: '15.00 - 16.30', desc: 'Sabtu Sore' },
    { id: 'D', day: 'Minggu', time: '08.00 - 09.30', desc: 'Minggu Pagi' },
    { id: 'E', day: 'Minggu', time: '09.30 - 11.00', desc: 'Minggu Pagi' },
    { id: 'F', day: 'Minggu', time: '15.00 - 16.30', desc: 'Minggu Sore' },
    { id: 'J', day: 'Jumat', time: '15.00 - 16.30', desc: 'Jumat Sore' },
  ];

  // Format date untuk input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Inisialisasi tanggal (default 30 hari terakhir)
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    const formattedEndDate = formatDateForInput(endDate);
    const formattedStartDate = formatDateForInput(startDate);
    
    setTempStartDate(formattedStartDate);
    setTempEndDate(formattedEndDate);
    setAppliedStartDate(formattedStartDate);
    setAppliedEndDate(formattedEndDate);
  }, []);

  // Fetch data hanya ketika:
  // 1. Period berubah
  // 2. appliedStartDate/appliedEndDate berubah (setelah Apply ditekan)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let start = null;
        let end = null;

        if (period === 'custom' && appliedStartDate && appliedEndDate) {
          start = new Date(appliedStartDate);
          end = new Date(appliedEndDate);
          // Tambahkan 1 hari ke end date untuk mencakup seluruh hari
          end.setDate(end.getDate() + 1);
        } else if (period === 'week') {
          start = new Date();
          start.setDate(start.getDate() - 7);
          end = new Date();
        } else if (period === 'month') {
          start = new Date();
          start.setMonth(start.getMonth() - 1);
          end = new Date();
        } else if (period === 'today') {
          start = new Date();
          end = new Date();
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        } else if (period === 'all') {
          // Untuk 'all', tidak ada filter tanggal
          start = null;
          end = null;
        }

        const res = await getStudentClassStats(start, end);
        setData(res || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [period, appliedStartDate, appliedEndDate]); // Hanya tergantung pada applied dates

  const handleShowHistory = (studentName, classId, history) => {
    setSelectedStudentName(studentName);
    setSelectedClassName(CLASS_CONFIG[classId]?.label || `Kelas ${classId}`);
    setModalTitle(`${studentName} - ${CLASS_CONFIG[classId]?.label}`);
    setSelectedHistory(Array.isArray(history) ? history.sort((a, b) => new Date(b) - new Date(a)) : []);
    setIsModalOpen(true);
  };

  // Fungsi untuk menerapkan tanggal custom
  const handleApplyCustomDate = () => {
    if (!tempStartDate || !tempEndDate) {
      alert('Harap pilih tanggal mulai dan tanggal akhir');
      return;
    }
    
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);
    
    if (start > end) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }
    
    // Set applied dates (yang benar-benar digunakan untuk fetch)
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    setPeriod('custom');
    setDateRangeApplied(true);
    setShowDatePicker(false);
    
    // Feedback visual
    console.log('Date range applied:', tempStartDate, 'to', tempEndDate);
  };

  // Fungsi untuk reset date picker ke applied values
  const handleCancelDatePicker = () => {
    setTempStartDate(appliedStartDate);
    setTempEndDate(appliedEndDate);
    setShowDatePicker(false);
  };

  // Fungsi untuk membuka date picker dengan nilai yang sedang aktif
  const handleOpenDatePicker = () => {
    setTempStartDate(appliedStartDate);
    setTempEndDate(appliedEndDate);
    setShowDatePicker(true);
  };

  // Fungsi export Excel (sama seperti sebelumnya, tapi disingkat untuk fokus pada filter)
  const exportHistoryToExcel = () => {
    if (selectedHistory.length === 0) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    const excelData = selectedHistory.map((date, index) => {
      const d = new Date(date);
      return {
        'No': index + 1,
        'Nama Siswa': selectedStudentName,
        'Kelas': selectedClassName,
        'Tanggal': d.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        'Hari': d.toLocaleDateString('id-ID', { weekday: 'long' }),
        'Waktu': d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        'Status': 'Hadir'
      };
    });

    const wb = XLSX.utils.book_new();
    const wsHistory = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, wsHistory, "Riwayat Kehadiran");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    const fileName = `Riwayat_${selectedStudentName.replace(/\s+/g, '_')}_${selectedClassName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.xlsx`;
    saveAs(blob, fileName);
  };

  const exportFullReportToExcel = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    const studentData = filteredData.map((student, idx) => {
      const total = student.totalInPeriod || 0;
      let status = 'Aktif';
      
      if (total === 0) status = 'Tidak Aktif';
      else if (total <= 2) status = 'Jarang';
      else if (total <= 4) status = 'Cukup';
      else status = 'Rutin';

      return {
        'No': idx + 1,
        'Nama Siswa': student.name,
        'Total Kehadiran': total,
        'Kelas A': student.classCounts?.A || 0,
        'Kelas B': student.classCounts?.B || 0,
        'Kelas C': student.classCounts?.C || 0,
        'Kelas D': student.classCounts?.D || 0,
        'Kelas E': student.classCounts?.E || 0,
        'Kelas F': student.classCounts?.F || 0,
        'Kelas J': student.classCounts?.J || 0,
        'Status': status
      };
    });

    const summaryData = [
      { 'Keterangan': 'Total Siswa', 'Nilai': filteredData.length },
      { 'Keterangan': 'Total Kehadiran', 'Nilai': getTotalStats.totalAttendance },
      { 'Keterangan': 'Periode Laporan', 'Nilai': getPeriodLabel() },
      { 'Keterangan': 'Filter Kelas', 'Nilai': filterClass === 'ALL' ? 'Semua Kelas' : CLASS_CONFIG[filterClass]?.label },
      { 'Keterangan': 'Tanggal Export', 'Nilai': new Date().toLocaleDateString('id-ID') }
    ];

    const wb = XLSX.utils.book_new();
    const wsStudents = XLSX.utils.json_to_sheet(studentData);
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    
    XLSX.utils.book_append_sheet(wb, wsStudents, "Data Siswa");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    const fileName = `Laporan_Kehadiran_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };

  // Filter data berdasarkan search query dan kelas
  const filteredData = useMemo(() => {
    let result = data.filter(s => {
      if (filterClass === 'ALL') return s.totalInPeriod > 0;
      return s.classCounts && s.classCounts[filterClass] > 0;
    });
    
    // Filter berdasarkan search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query)
      );
    }
    
    return result.sort((a, b) => (b.totalInPeriod || 0) - (a.totalInPeriod || 0));
  }, [data, filterClass, searchQuery]);

  const getTotalStats = useMemo(() => {
    const totals = { totalStudents: filteredData.length, totalAttendance: 0 };
    classLegend.forEach(cls => {
      totals[cls.id] = filteredData.reduce((sum, student) => 
        sum + (student.classCounts?.[cls.id] || 0), 0
      );
      totals.totalAttendance += totals[cls.id];
    });
    return totals;
  }, [filteredData]);

  const getPeriodLabel = () => {
    if (period === 'custom' && appliedStartDate && appliedEndDate) {
      const start = new Date(appliedStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const end = new Date(appliedEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${start} - ${end}`;
    }
    if (period === 'week') return '7 Hari Terakhir';
    if (period === 'month') return '30 Hari Terakhir';
    if (period === 'today') return 'Hari Ini';
    if (period === 'all') return 'Semua Waktu';
    return 'Pilih Periode';
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterClass('ALL');
    setPeriod('month');
    
    // Reset ke default dates (30 hari terakhir)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    const formattedEndDate = formatDateForInput(endDate);
    const formattedStartDate = formatDateForInput(startDate);
    
    setTempStartDate(formattedStartDate);
    setTempEndDate(formattedEndDate);
    setAppliedStartDate(formattedStartDate);
    setAppliedEndDate(formattedEndDate);
    setDateRangeApplied(false);
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan Kehadiran Siswa</h1>
            <p className="text-gray-600">Analisis kehadiran per kelas dengan filter yang fleksibel</p>
          </div>
          <button
            onClick={exportFullReportToExcel}
            disabled={filteredData.length === 0}
            className="px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Total Siswa Aktif</div>
            <div className="text-2xl font-bold text-gray-900">{getTotalStats.totalStudents}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Total Kehadiran</div>
            <div className="text-2xl font-bold text-blue-600">{getTotalStats.totalAttendance}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Periode</div>
            <div className="text-lg font-semibold text-gray-900">{getPeriodLabel()}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Filter Kelas</div>
            <div className="text-lg font-semibold text-gray-900">
              {filterClass === 'ALL' ? 'Semua Kelas' : CLASS_CONFIG[filterClass]?.label}
            </div>
          </div>
        </div>

        {/* Class Legend Box */}
        <div className="bg-white rounded-xl shadow mb-6 p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-700">Keterangan Kelas</h2>
            <span className="text-xs text-gray-500">Total kehadiran: {getTotalStats.totalAttendance}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {classLegend.map(cls => (
              <div 
                key={cls.id} 
                className={`p-3 rounded-lg border-l-4 ${CLASS_CONFIG[cls.id]?.color} bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white transition-all`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">Kelas {cls.id}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-700 shadow-sm">
                    {getTotalStats[cls.id]}x
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{cls.day}</div>
                  <div className="text-blue-600">{cls.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow mb-6 p-4 hover:shadow-md transition-shadow">
          <div className="space-y-6">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Cari Siswa
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama siswa untuk mencari..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Periode Waktu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Rentang Waktu
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['today', 'week', 'month', 'all', 'custom'].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        if (p === 'custom') {
                          handleOpenDatePicker();
                        } else {
                          setPeriod(p);
                          setShowDatePicker(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        period === p
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {p === 'today' ? 'Hari Ini' : 
                       p === 'week' ? '7 Hari' : 
                       p === 'month' ? '30 Hari' : 
                       p === 'all' ? 'Semua' : 
                       'Custom Range'}
                    </button>
                  ))}
                </div>

                {/* Date Picker untuk Custom */}
                {showDatePicker && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="mb-3">
                      <h3 className="font-medium text-blue-800">Pilih Periode Custom</h3>
                      <p className="text-sm text-blue-600">Pilih tanggal mulai dan akhir, lalu klik "Terapkan"</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dari Tanggal
                        </label>
                        <input
                          type="date"
                          value={tempStartDate}
                          onChange={(e) => setTempStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          max={tempEndDate || undefined}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sampai Tanggal
                        </label>
                        <input
                          type="date"
                          value={tempEndDate}
                          onChange={(e) => setTempEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          min={tempStartDate || undefined}
                        />
                      </div>
                    </div>

                    {/* Preview tanggal yang dipilih */}
                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="text-sm text-gray-600">Preview:</div>
                      <div className="font-medium text-gray-900">
                        {tempStartDate && tempEndDate ? (
                          <>
                            {new Date(tempStartDate).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })} 
                            {" "}→{" "}
                            {new Date(tempEndDate).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </>
                        ) : (
                          <span className="text-gray-400">Pilih kedua tanggal</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={handleApplyCustomDate}
                        disabled={!tempStartDate || !tempEndDate}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Terapkan Periode
                      </button>
                      <button
                        onClick={handleCancelDatePicker}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Display applied custom date range */}
                {period === 'custom' && appliedStartDate && appliedEndDate && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-green-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Periode Custom Aktif</span>
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          {new Date(appliedStartDate).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })} 
                          {" - "}
                          {new Date(appliedEndDate).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                      <button
                        onClick={handleOpenDatePicker}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Ubah
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏊‍♂️ Filter Kelas
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="ALL">Semua Kelas</option>
                  {classLegend.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      Kelas {cls.id} ({cls.day}, {cls.time})
                    </option>
                  ))}
                </select>
                
                {/* Kelas Statistics */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Statistik Kelas:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {classLegend.slice(0, 4).map(cls => (
                      <div key={cls.id} className="text-xs">
                        <span className="font-medium">Kelas {cls.id}:</span>
                        <span className="ml-1 text-blue-600">{getTotalStats[cls.id]}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Semua Filter
              </button>
              
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Total data: {data.length} siswa • {getTotalStats.totalAttendance} kehadiran</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div>
                  <span className="font-medium text-blue-800">Hasil pencarian untuk: </span>
                  <span className="text-blue-600">"{searchQuery}"</span>
                  <span className="text-blue-700 ml-2">({filteredData.length} siswa ditemukan)</span>
                </div>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hapus Pencarian
              </button>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition-shadow">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg text-gray-500 mb-2">Tidak ada data kehadiran</p>
              <p className="text-sm text-gray-400">
                {searchQuery 
                  ? `Tidak ditemukan siswa dengan nama "${searchQuery}"`
                  : 'Coba ubah filter, periode waktu, atau kata pencarian'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Nama Siswa
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                      {classLegend.map(cls => (
                        <th key={cls.id} className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex flex-col items-center">
                            <span className="font-bold">Kelas {cls.id}</span>
                            <span className="text-xs text-gray-500 mt-1">{cls.day.slice(0, 3)}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map(student => (
                      <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          {searchQuery && (
                            <div className="text-xs text-blue-600 mt-1">
                              Cocok dengan pencarian
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-sm">
                            {student.totalInPeriod || 0}
                          </span>
                        </td>
                        {classLegend.map(cls => {
                          const count = student.classCounts?.[cls.id] || 0;
                          return (
                            <td key={cls.id} className="px-4 py-4 whitespace-nowrap text-center">
                              {count > 0 ? (
                                <button
                                  onClick={() => handleShowHistory(student.name, cls.id, student.classHistory?.[cls.id] || [])}
                                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all transform hover:scale-110 ${CLASS_CONFIG[cls.id]?.color.replace('border', 'bg').replace('text-white', 'text-white')} shadow-sm hover:shadow-md`}
                                  title={`Klik untuk melihat riwayat di Kelas ${cls.id}`}
                                >
                                  {count}x
                                </button>
                              ) : (
                                <span className="inline-flex items-center justify-center w-10 h-10 text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-2">
                  <div>
                    Menampilkan <span className="font-semibold">{filteredData.length}</span> siswa
                    {searchQuery && <span className="text-blue-600 ml-2">(Hasil pencarian)</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      Total kehadiran: <span className="font-semibold text-blue-600">{getTotalStats.totalAttendance}</span>
                    </div>
                    <div>
                      Rata-rata: <span className="font-semibold">{(getTotalStats.totalAttendance / filteredData.length).toFixed(1)}</span> per siswa
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Popup */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={modalTitle}
          size="lg"
        >
          <div className="space-y-4">
            {selectedHistory.length > 0 ? (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="mb-3 md:mb-0">
                    <div className="font-bold text-lg text-blue-900">{selectedStudentName}</div>
                    <div className="text-sm text-blue-700">
                      <span className="font-semibold">{selectedClassName}</span> • Total hadir: <span className="font-bold">{selectedHistory.length} kali</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={exportHistoryToExcel}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 flex items-center gap-2 transition-colors shadow hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Excel
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                  {selectedHistory.map((date, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(date).toLocaleDateString('id-ID', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            Jam: <span className="font-semibold text-blue-600">
                              {new Date(date).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} WIB
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(date).toLocaleDateString('id-ID', { 
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full mt-1 font-medium">
                          Hadir
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">Tidak ada riwayat kehadiran</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-xs text-gray-500">
                Periode: {getPeriodLabel()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Info Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Laporan kehadiran siswa - Sistem Absensi Pool Club • {getPeriodLabel()}</p>
          <p className="mt-1">
            {searchQuery 
              ? `Hasil pencarian: "${searchQuery}" • ` 
              : ''}
            Data diperbarui: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassReportPage;