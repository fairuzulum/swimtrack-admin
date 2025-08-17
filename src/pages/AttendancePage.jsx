import React, { useState, useEffect, useMemo } from 'react';
import { getAllStudents, processAttendance } from '../services/studentService';
import { Link } from 'react-router-dom';

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    const studentData = await getAllStudents();
    setStudents(studentData);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAttend = async (student) => {
    if(window.confirm(`Yakin ingin menandai "${student.name}" hadir hari ini?`)) {
      setProcessingId(student.id);
      try {
        await processAttendance(student.id);
        alert(`${student.name} berhasil diabsen!`);
        fetchStudents(); // Refresh data setelah absen
      } catch (error) {
        alert(`Gagal absen: ${error.message}`);
      } finally {
        setProcessingId(null);
      }
    }
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
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Absen Kehadiran</h1>
        {/* ... (Kolom pencarian tetap sama) ... */}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Member</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sisa Sesi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4">
                  <Link to={`/member/${student.id}`} className="text-sm font-medium text-blue-600 hover:underline">{student.name}</Link>
                  <p className="text-sm text-gray-500">{student.nickname || ''}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${student.remainingSessions > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {student.remainingSessions}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleAttend(student)}
                    disabled={processingId === student.id}
                    className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {processingId === student.id ? '...' : 'Hadir'}
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