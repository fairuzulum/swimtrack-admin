import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentById, getAttendanceHistory, getPaymentHistory, updateStudentSessions } from '../services/studentService';

// Komponen baru untuk form edit sesi
const EditSessionForm = ({ student, onSessionUpdate }) => {
  const [sessions, setSessions] = useState(student.remainingSessions);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const newSessionCount = parseInt(sessions, 10);
    if (isNaN(newSessionCount)) {
      alert("Harap masukkan angka yang valid.");
      return;
    }
    
    setLoading(true);
    try {
      await updateStudentSessions(student.id, newSessionCount);
      alert("Jumlah pertemuan berhasil diperbarui!");
      onSessionUpdate(newSessionCount); // Callback untuk update data di halaman utama
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <label htmlFor="session-input" className="block text-sm font-medium text-gray-700">Edit Sisa Pertemuan Manual</label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id="session-input"
          type="number"
          value={sessions}
          onChange={(e) => setSessions(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
};


const StudentDetailPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mengambil semua data secara paralel untuk performa lebih baik
        const [studentData, attendanceData, paymentData] = await Promise.all([
          getStudentById(id),
          getAttendanceHistory(id),
          getPaymentHistory(id)
        ]);
        setStudent(studentData);
        setAttendance(attendanceData);
        setPayments(paymentData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSessionUpdate = (newSessionCount) => {
    // Update state student secara lokal agar UI langsung berubah tanpa perlu fetch ulang
    setStudent(prevStudent => ({ ...prevStudent, remainingSessions: newSessionCount }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'Tanggal tidak valid';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  if (loading) return <div className="text-center p-8 text-gray-500">Memuat detail member...</div>;
  if (!student) return <div className="text-center p-8 text-gray-500">Member tidak ditemukan.</div>;

  return (
    <div className="space-y-8">
      <Link to="/" className="text-blue-600 hover:underline font-semibold">&larr; Kembali ke Daftar Member</Link>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
        {student.nickname && <p className="text-lg text-gray-500">({student.nickname})</p>}
        
        <div className="mt-4 flex items-center gap-2">
            <span className="text-gray-600">Sisa Pertemuan:</span>
            <span className={`text-2xl font-bold ${student.remainingSessions > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {student.remainingSessions}
            </span>
        </div>

        {/* Form untuk edit sesi manual ditampilkan di sini */}
        <EditSessionForm student={student} onSessionUpdate={handleSessionUpdate} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Riwayat Absensi */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Kehadiran ({attendance.length})</h2>
          <div className="max-h-96 overflow-y-auto pr-2">
            <ul className="divide-y divide-gray-200">
              {attendance.length > 0 ? attendance.map(item => (
                <li key={item.id} className="py-3 text-gray-700">{formatDate(item.date)}</li>
              )) : <li className="py-3 text-gray-400">Belum ada riwayat.</li>}
            </ul>
          </div>
        </div>

        {/* Riwayat Pembayaran */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Pembayaran ({payments.length})</h2>
          <div className="max-h-96 overflow-y-auto pr-2">
            <ul className="divide-y divide-gray-200">
              {payments.length > 0 ? payments.map(item => (
                <li key={item.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-gray-700">{formatDate(item.date)}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.amount)}</p>
                  </div>
                  <span className="font-semibold text-green-600">+{item.sessionsAdded} Pertemuan</span>
                </li>
              )) : <li className="py-3 text-gray-400">Belum ada riwayat.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;