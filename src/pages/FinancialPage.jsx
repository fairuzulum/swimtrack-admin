import React, { useState, useEffect } from 'react';
import { getFinancialReport } from '../services/studentService';

const FinancialPage = () => {
  const [report, setReport] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const reportData = await getFinancialReport();
        setReport(reportData);
        const total = reportData.reduce((sum, item) => sum + item.totalAmount, 0);
        setTotalRevenue(total);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) {
      return <div className="text-center p-8 text-gray-500">Menghitung laporan keuangan...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Card Total Pemasukan */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold opacity-80">Total Pemasukan Keseluruhan</h3>
        <p className="text-4xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
      </div>

      {/* Tabel Rincian Pemasukan */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Rincian Pemasukan per Member</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Member</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pembayaran</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.length > 0 ? (
                report.map((item) => (
                  <tr key={item.studentName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">{formatCurrency(item.totalAmount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-8 text-gray-500">Belum ada data pemasukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;