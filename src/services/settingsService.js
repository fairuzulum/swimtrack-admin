import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Referensi ke dokumen tunggal tempat menyimpan semua password
const settingsDocRef = doc(db, "app_settings", "menuPasswords");

/**
 * Mengambil konfigurasi PIN menu dari Firestore.
 * @returns {Promise<Object|null>} Objek konfigurasi atau null jika tidak ada.
 */
export const getMenuPasswords = async () => {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Jika dokumen belum ada, kembalikan nilai default
      console.log("Dokumen pengaturan tidak ditemukan, akan dibuat saat menyimpan.");
      return null;
    }
  } catch (error) {
    console.error("Error mengambil pengaturan PIN:", error);
    throw new Error("Gagal mengambil data pengaturan dari server.");
  }
};

/**
 * Menyimpan atau memperbarui konfigurasi PIN menu di Firestore.
 * @param {Object} settingsData - Objek berisi semua pengaturan PIN.
 */
export const saveMenuPasswords = async (settingsData) => {
  try {
    // setDoc akan membuat dokumen jika belum ada, atau menimpanya jika sudah ada.
    await setDoc(settingsDocRef, settingsData);
  } catch (error)
  {
    console.error("Error menyimpan pengaturan PIN:", error);
    throw new Error("Gagal menyimpan data pengaturan ke server.");
  }
};