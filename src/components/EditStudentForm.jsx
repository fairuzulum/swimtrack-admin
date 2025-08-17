import React, { useState, useEffect } from 'react';
import { updateStudent } from '../services/studentService';

const EditStudentForm = ({ student, onSuccess }) => {
  // State diisi dengan data siswa yang dipilih
  const [name, setName] = useState(student.name);
  const [nickname, setNickname] = useState(student.nickname || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect untuk update form jika siswa yang dipilih berubah
  useEffect(() => {
    setName(student.name);
    setNickname(student.nickname || '');
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Nama Lengkap wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await updateStudent(student.id, { name, nickname });
      onSuccess(); // Panggil fungsi onSuccess dari parent jika berhasil
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="editFullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          id="editFullName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="editNickname" className="block text-sm font-medium text-gray-700">Nama Panggilan (Opsional)</label>
        <input
          id="editNickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

export default EditStudentForm;