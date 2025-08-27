import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents, deleteStudent } from '../services/studentService';
import Modal from './Modal';
import EditStudentForm from './EditStudentForm';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; // Import ikon

const StudentList = ({ refreshTrigger }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  // State untuk sorting
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const studentData = await getAllStudents();
      setStudents(studentData);
      setLoading(false);
    };

    fetchStudents();
  }, [refreshTrigger]);

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (student) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus member "${student.name}"? Aksi ini tidak dapat dibatalkan.`)) {
      try {
        await deleteStudent(student.id);
        alert('Member berhasil dihapus.');
        setStudents(prevStudents => prevStudents.filter(s => s.id !== student.id));
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    alert('Data member berhasil diperbarui.');
    const fetch = async () => {
        setLoading(true);
        const studentData = await getAllStudents();
        setStudents(studentData);
        setLoading(false);
    };
    fetch();
  };

  // Logika untuk sorting dan filtering
  const sortedAndFilteredStudents = useMemo(() => {
    let sortableStudents = [...students];

    // Sorting
    if (sortConfig.key) {
      sortableStudents.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Penanganan untuk nilai null atau undefined (misal: nickname)
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // Penanganan untuk tipe data number (remainingSessions)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        // Penanganan untuk tipe data string (name, nickname)
        if (aValue.toString().toLowerCase() < bValue.toString().toLowerCase()) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue.toString().toLowerCase() > bValue.toString().toLowerCase()) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    // Filtering
    if (!searchTerm) return sortableStudents;
    return sortableStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm, sortConfig]);

  // Fungsi untuk mengubah konfigurasi sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Fungsi untuk menampilkan ikon sorting yang sesuai
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="inline-block ml-2 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <FaSortUp className="inline-block ml-2 text-blue-600" /> : 
      <FaSortDown className="inline-block ml-2 text-blue-600" />;
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Memuat data member...</div>;
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-gray-800">Daftar Member FSS</h2>
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
                {/* =============================================================== */}
                {/* HEADER TABEL DIBUAT INTERAKTIF DI SINI */}
                {/* =============================================================== */}
                <th onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Nama Lengkap {getSortIcon('name')}
                </th>
                <th onClick={() => requestSort('nickname')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Nama Panggilan {getSortIcon('nickname')}
                </th>
                <th onClick={() => requestSort('remainingSessions')} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Sisa Pertemuan {getSortIcon('remainingSessions')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredStudents.length > 0 ? (
                sortedAndFilteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.nickname || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${student.remainingSessions > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.remainingSessions}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => navigate(`/member/${student.id}`)} className="text-green-600 hover:text-green-900 font-semibold">Detail</button>
                        <button onClick={() => handleEditClick(student)} className="text-blue-600 hover:text-blue-900 font-semibold">Edit</button>
                        <button onClick={() => handleDeleteClick(student)} className="text-red-600 hover:text-red-900 font-semibold">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Member tidak ditemukan.' : 'Belum ada member terdaftar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Data Member"
      >
        {selectedStudent && <EditStudentForm student={selectedStudent} onSuccess={handleEditSuccess} />}
      </Modal>
    </>
  );
};

export default StudentList;