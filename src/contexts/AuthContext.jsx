import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// 1. Membuat Context
const AuthContext = createContext();

// 2. Membuat "Provider" component
// Komponen ini akan "membungkus" seluruh aplikasi kita
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // State untuk loading awal

  useEffect(() => {
    // onAuthStateChanged adalah listener dari Firebase
    // yang akan berjalan setiap kali status login berubah
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Selesai loading setelah status user diketahui
    });

    // Membersihkan listener saat komponen tidak lagi digunakan
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  // 3. Mengembalikan Provider dengan value
  // Jika masih loading, kita tampilkan pesan loading
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 4. Membuat custom hook agar lebih mudah digunakan
export const useAuth = () => {
  return useContext(AuthContext);
};