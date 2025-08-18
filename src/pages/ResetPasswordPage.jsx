import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordReset } from '../services/authService';

const ResetPasswordPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!currentUser?.email) {
      setError("Tidak dapat menemukan email pengguna yang sedang login.");
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin mengirim link reset password ke ${currentUser.email}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordReset(currentUser.email);
      setMessage(`Link untuk mereset password telah berhasil dikirim ke email ${currentUser.email}. Silakan cek inbox atau folder spam Anda.`);
    } catch (err) {
      setError(`Gagal mengirim email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Reset Password Akun</h1>
      <p className="text-gray-600 mb-6">
        Fitur ini akan mengirimkan sebuah link ke email Anda yang sedang aktif untuk mengatur ulang password. Pastikan Anda memiliki akses ke email tersebut.
      </p>

      <div className="p-4 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-500">Email Akun Admin Saat Ini:</p>
        <p className="font-semibold text-gray-800 text-lg">{currentUser?.email || 'Tidak terdeteksi'}</p>
      </div>

      {message && <p className="mt-4 text-sm text-center text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}
      {error && <p className="mt-4 text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleResetPassword}
          disabled={loading || !currentUser?.email}
          className="w-full md:w-auto px-8 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;