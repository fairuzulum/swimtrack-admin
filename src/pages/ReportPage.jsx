import React, { useState } from 'react';
import { exportStudentsToExcel, importStudentsFromExcel } from '../services/studentService';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ReportPage = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const handleExport = async () => {
    if (!window.confirm("Yakin ingin mengunduh laporan member dalam format Excel?")) return;
    
    setExporting(true);
    try {
      // Panggil fungsi service yang akan menghasilkan workbook excel
      const wb = await exportStudentsToExcel();
      
      // Ubah workbook menjadi file binary
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Buat file Blob dan unduh
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const date = new Date().toISOString().slice(0, 10);
      saveAs(blob, `laporan-member-fss-${date}.xlsx`);

      alert("Laporan Excel berhasil dibuat!");
    } catch (error) {
      console.error(error);
      alert("Gagal membuat laporan: " + error.message);
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
      alert("Harap pilih file Excel terlebih dahulu.");
      return;
    }
    
    const confirmation = prompt("PERINGATAN: Fitur ini akan MENIMPA data 'Panggilan' dan 'Sisa Pertemuan' berdasarkan NAMA LENGKAP yang cocok di file Excel. Pastikan nama di file sudah benar. Ketik 'UPDATE DATA' untuk melanjutkan.");
    if (confirmation !== 'UPDATE DATA') {
      alert("Impor dibatalkan.");
      return;
    }
    
    setImporting(true);
    try {
      const updatedCount = await importStudentsFromExcel(importFile);
      alert(`Impor berhasil! ${updatedCount} data member telah diperbarui.`);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert(`Impor data gagal: ${error.message}`);
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Laporan Excel</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800">1. Export Laporan ke Excel</h2>
        <p className="mt-2 text-gray-600">Unduh data member (Nama, Panggilan, Sisa Pertemuan) ke dalam sebuah file Excel (.xlsx) untuk keperluan laporan atau arsip.</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {exporting ? 'Membuat Laporan...' : 'Export ke Excel'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-500">
        <h2 className="text-xl font-bold text-purple-700">2. Import Laporan dari Excel</h2>
        <p className="mt-2 text-gray-600"><strong className="font-bold text-purple-600">Penting:</strong> Gunakan fitur ini untuk memperbarui data 'Panggilan' dan 'Sisa Pertemuan' secara massal. Sistem akan mencocokkan data berdasarkan kolom 'Nama Lengkap'.</p>
        <div className="mt-4">
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>
         {importFile && <p className="text-sm mt-2 text-gray-500">File dipilih: {importFile.name}</p>}
        <button
          onClick={handleImport}
          disabled={importing || !importFile}
          className="mt-4 px-6 py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
        >
          {importing ? 'Mengimpor...' : 'Import & Update Data'}
        </button>
      </div>
    </div>
  );
};

export default ReportPage;