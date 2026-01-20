export const CLASS_CONFIG = {
  A: { label: 'Kelas A', time: 'Sabtu, 08.00 - 09.30', color: 'bg-red-100 text-red-800 border-red-200' },
  B: { label: 'Kelas B', time: 'Sabtu, 09.30 - 11.00', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  C: { label: 'Kelas C', time: 'Sabtu, 15.00 - 16.30', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  D: { label: 'Kelas D', time: 'Minggu, 08.00 - 09.30', color: 'bg-green-100 text-green-800 border-green-200' },
  E: { label: 'Kelas E', time: 'Minggu, 09.30 - 11.00', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  F: { label: 'Kelas F', time: 'Minggu, 15.00 - 16.30', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  J: { label: 'Kelas J', time: 'Jumat, 15.00 - 16.30', color: 'bg-orange-900 text-orange-100 border-orange-800' }, // Coklat (Orange gelap)
  X: { label: 'Lainnya', time: 'Luar Jadwal', color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export const detectClassFromTime = (dateObj) => {
  if (!dateObj) return null;
  const date = new Date(dateObj);
  const day = date.getDay(); 
  const hour = date.getHours();
  const min = date.getMinutes();
  const time = hour + (min / 60);

  if (day === 5) { if (time >= 14 && time < 18) return 'J'; } // Jumat
  if (day === 6) { // Sabtu
    if (time >= 7 && time < 9.4) return 'A';
    if (time >= 9.4 && time < 12) return 'B';
    if (time >= 14 && time < 18) return 'C';
  }
  if (day === 0) { // Minggu
    if (time >= 7 && time < 9.4) return 'D';
    if (time >= 9.4 && time < 12) return 'E';
    if (time >= 14 && time < 18) return 'F';
  }
  return 'X'; 
};