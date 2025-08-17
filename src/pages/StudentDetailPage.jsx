import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentById, getAttendanceHistory, getPaymentHistory } from '../services/studentService';

const StudentDetailPage = () => {
  const { id } = useParams(); // Mengambil ID dari URL
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentData = await getStudentById(id);
        const attendanceData = await getAttendanceHistory(id);
        const paymentData = await getPaymentHistory(id);
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

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'Tanggal tidak valid';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Siswa tidak ditemukan.</div>;

  return (
    <div className="space-y-8">
      <Link to="/" className="text-blue-600 hover:underline">&larr; Kembali ke Daftar Member</Link>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
        <p className="text-lg text-gray-500">{student.nickname}</p>
        <div className={`mt-4 inline-block px-4 py-2 text-white font-bold rounded-lg ${student.remainingSessions > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
          Sisa Sesi: {student.remainingSessions}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Riwayat Absensi */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Kehadiran</h2>
          <ul className="divide-y divide-gray-200">
            {attendance.map(item => (
              <li key={item.id} className="py-3">{formatDate(item.date)}</li>
            ))}
          </ul>
        </div>

        {/* Riwayat Pembayaran */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Pembayaran</h2>
           <ul className="divide-y divide-gray-200">
            {payments.map(item => (
              <li key={item.id} className="py-3 flex justify-between">
                <span>{formatDate(item.date)}</span>
                <span className="font-semibold text-green-600">+{item.sessionsAdded} Sesi</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;