import React, { useState, useEffect, useMemo } from 'react';
import { getAllStudents, processAttendance, checkIfStudentAttendedToday } from '../services/studentService';
import { Link } from 'react-router-dom';

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Fungsi untuk mengambil data siswa dan status absensi harian mereka
  const fetchStudentsWithAttendanceStatus = async () => {
    setLoading(true);
    const studentData = await getAllStudents();

    // Cek status absensi untuk setiap siswa secara paralel (lebih cepat)
    const studentsWithStatus = await Promise.all(
      studentData.map(async (student) => {
        const hasAttendedToday = await checkIfStudentAttendedToday(student.id);
        return { ...student, hasAttendedToday };
      })
    );

    setStudents(studentsWithStatus);
    setLoading(false);
  };

  // Mengambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchStudentsWithAttendanceStatus();
  }, []);

  const handleAttend = async (student) => {
    if (window.confirm(`Yakin ingin menandai "${student.name}" hadir hari ini?`)) {
      setProcessingId(student.id);
      try {
        await processAttendance(student.id);
        alert(`${student.name} berhasil diabsen!`);
        
        // Update state lokal secara langsung untuk UI yang responsif tanpa fetch ulang
        setStudents(currentStudents =>
          currentStudents.map(s => 
            s.id === student.id ? { ...s, hasAttendedToday: true, remainingSessions: s.remainingSessions - 1 } : s
          )
        );

      } catch (error) {
        alert(`Gagal absen: ${error.message}`);
      } finally {
        setProcessingId(null);
      }
    }
  };

  // Logika untuk filter pencarian berdasarkan nama atau nama panggilan
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Memuat data & status kehadiran...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Absen Kehadiran</h1>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari nama atau panggilan..."
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
                <td className="px-6 py-4">
                  <Link to={`/member/${student.id}`} className="text-sm font-medium text-blue-600 hover:underline">{student.name}</Link>
                  {student.nickname && <p className="text-sm text-gray-500">({student.nickname})</p>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${student.remainingSessions > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {student.remainingSessions}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleAttend(student)}
                    disabled={processingId === student.id || student.hasAttendedToday}
                    className={`px-4 py-2 font-semibold text-white rounded-lg transition-colors
                      ${student.hasAttendedToday 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'}
                      ${processingId === student.id ? 'bg-gray-400 cursor-wait' : ''}
                    `}
                  >
                    {processingId === student.id ? '...' : (student.hasAttendedToday ? 'Sudah Hadir' : 'Hadir')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;