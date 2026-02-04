import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToFinancialReport } from '../services/studentService';

const FinancialPage = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null); // Untuk toggle detail

  useEffect(() => {
    const unsubscribe = subscribeToFinancialReport(
      (data) => {
        setReport(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  const filteredReport = useMemo(() => {
    return report.filter(item => 
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [report, searchTerm]);

  const totalRevenue = useMemo(() => {
    return report.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [report]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate();
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Sinkronisasi data...</div>;

  return (
    <div className="space-y-6">
      {/* Card Total */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider">Pemasukan Real-time</h3>
        <p className="text-4xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <input 
            type="text"
            placeholder="Cari nama member..."
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">MEMBER</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">TOTAL BAYAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReport.map((item) => (
                <React.Fragment key={item.studentId}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === item.studentId ? null : item.studentId)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        {item.studentName}
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {item.paymentHistory.length}x Bayar
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                  
                  {/* DETAIL PEMBAYARAN (Muncul saat baris di klik) */}
                  {expandedId === item.studentId && (
                    <tr className="bg-gray-50/50">
                      <td colSpan="2" className="px-6 py-3">
                        <div className="space-y-2 border-l-2 border-blue-200 pl-4 my-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Riwayat Transaksi</p>
                          {item.paymentHistory.map((pay, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">{formatDate(pay.date)}</span>
                              <span className="font-semibold text-gray-700">{formatCurrency(pay.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;