import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const LogoutButton = () => {
  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Gagal logout:", error);
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;