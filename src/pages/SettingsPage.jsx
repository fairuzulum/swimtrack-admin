import React, { useState, useEffect } from 'react';
import { getMenuPasswords, saveMenuPasswords } from '../services/settingsService';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    listSiswa: { isEnabled: false, pin: '' },
    register: { isEnabled: false, pin: '' },
    absensi: { isEnabled: false, pin: '' },
    pembayaran: { isEnabled: false, pin: '' },
    keuangan: { isEnabled: false, pin: '' },
    laporan: { isEnabled: false, pin: '' }, // <-- TAMBAHKAN INI
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const currentSettings = await getMenuPasswords();
        if (currentSettings) {
          // Pastikan semua field ada, termasuk yang baru
          setSettings(prev => ({
            ...{
              listSiswa: { isEnabled: false, pin: '' },
              register: { isEnabled: false, pin: '' },
              absensi: { isEnabled: false, pin: '' },
              pembayaran: { isEnabled: false, pin: '' },
              keuangan: { isEnabled: false, pin: '' },
              laporan: { isEnabled: false, pin: '' },
            },
            ...currentSettings 
          }));
        }
      } catch (error) {
        alert('Gagal memuat pengaturan: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (menu) => {
    setSettings(prev => ({
      ...prev,
      [menu]: { ...prev[menu], isEnabled: !prev[menu].isEnabled }
    }));
  };

  const handlePinChange = (menu, value) => {
    // Hanya izinkan angka dan maksimal 6 digit
    if (/^\d{0,6}$/.test(value)) {
      setSettings(prev => ({
        ...prev,
        [menu]: { ...prev[menu], pin: value }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveMenuPasswords(settings);
      alert('Pengaturan PIN berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan pengaturan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // TAMBAHKAN LABEL BARU DI SINI
  const menuLabels = {
    listSiswa: 'Daftar Member (App)',
    register: 'Registrasi Member (App)',
    absensi: 'Absensi (App)',
    pembayaran: 'Pembayaran (App)',
    keuangan: 'Keuangan (App)',
    laporan: 'Laporan Kehadiran (App)', // <-- TAMBAHKAN INI
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Memuat pengaturan...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan PIN Menu Aplikasi</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.keys(menuLabels).map(menuKey => (
          <div key={menuKey} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-700">{menuLabels[menuKey]}</h3>
              <p className="text-sm text-gray-500">
                {settings[menuKey]?.isEnabled ? 'PIN Aktif' : 'PIN Nonaktif'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[menuKey]?.isEnabled || false}
                  onChange={() => handleToggle(menuKey)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <input
                type="password"
                value={settings[menuKey]?.pin || ''}
                onChange={(e) => handlePinChange(menuKey, e.target.value)}
                placeholder="6 Digit PIN"
                maxLength="6"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                disabled={!settings[menuKey]?.isEnabled}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving || loading}
            className="w-full md:w-auto px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;