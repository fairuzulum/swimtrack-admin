import React, { useState } from 'react';
import { processPayment } from '../services/studentService';

const PaymentForm = ({ student, onSuccess }) => {
  const [amount, setAmount] = useState(250000); // Default amount
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount % 250000 !== 0) {
      setError('Jumlah pembayaran harus kelipatan Rp 250.000.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await processPayment(student.id, paymentAmount);
      onSuccess(); // Panggil fungsi onSuccess dari parent jika berhasil
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah Pembayaran</label>
        <p className="text-xs text-gray-500 mb-2">Satu paket (4 pertemuan) = Rp 250.000</p>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="250000"
          min="250000"
          className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-600 mt-2">
            Total Pertemuan Ditambahkan: <strong>{(Number(amount) / 250000) * 4 || 0} Pertemuan</strong>
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Memproses...' : `Bayar ${formatCurrency(amount)}`}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;