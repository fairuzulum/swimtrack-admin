import React, { useState } from 'react';
import { exportAllData, importAllData } from '../services/studentService';
import { saveAs } from 'file-saver'; // Impor library yang sudah diinstall

const BackupPage = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const handleExport = async () => {
    if (!window.confirm("Apakah Anda yakin ingin mengekspor semua data member?")) return;
    
    setExporting(true);
    try {
      const data = await exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      
      const date = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
      saveAs(blob, `backup-fss-member-${date}.json`);

      alert("Ekspor data berhasil!");
    } catch (error) {
      console.error(error);
      alert("Ekspor data gagal. Cek console untuk detail.");
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert("Harap pilih file backup terlebih dahulu.");
      return;
    }
    
    // Konfirmasi berlapis untuk mencegah kesalahan
    const confirmation1 = prompt("PERINGATAN: Aksi ini akan MENGHAPUS SEMUA data member yang ada dan menggantinya dengan data dari file backup. Aksi ini tidak dapat dibatalkan. Ketik 'HAPUS DAN GANTI' untuk melanjutkan.");
    if (confirmation1 !== 'HAPUS DAN GANTI') {
      alert("Impor dibatalkan.");
      return;
    }
    
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.students || !Array.isArray(json.students)) {
          throw new Error("Format file backup tidak valid.");
        }
        await importAllData(json.students);
        alert("Impor data berhasil! Data member telah dipulihkan.");
        // Mungkin perlu refresh halaman untuk melihat data baru
        window.location.reload(); 
      } catch (error) {
        console.error(error);
        alert(`Impor data gagal: ${error.message}`);
      } finally {
        setImporting(false);
        setImportFile(null);
      }
    };
    reader.readAsText(importFile);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Backup & Restore Data</h1>
      
      {/* Bagian Export */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800">1. Export Data Member</h2>
        <p className="mt-2 text-gray-600">Simpan semua data member, termasuk sisa pertemuan, riwayat absensi, dan riwayat pembayaran ke dalam satu file JSON yang aman.</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {exporting ? 'Mengekspor...' : 'Export Semua Data'}
        </button>
      </div>

      {/* Bagian Import */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-500">
        <h2 className="text-xl font-bold text-red-700">2. Import Data Member</h2>
        <p className="mt-2 text-gray-600"><strong className="font-bold text-red-600">PERINGATAN:</strong> Mengimpor data akan menghapus semua data member yang ada saat ini. Gunakan fitur ini dengan hati-hati, misalnya saat memindahkan data ke perangkat baru.</p>
        <div className="mt-4 flex items-center gap-4">
          <input 
            type="file" 
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
         {importFile && <p className="text-sm mt-2 text-gray-500">File dipilih: {importFile.name}</p>}
        <button
          onClick={handleImport}
          disabled={importing || !importFile}
          className="mt-4 px-6 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
        >
          {importing ? 'Mengimpor...' : 'Import & Ganti Data Lama'}
        </button>
      </div>
    </div>
  );
};

export default BackupPage;