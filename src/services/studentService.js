import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Referensi ke koleksi 'students' di Firestore
const studentCollectionRef = collection(db, "students");

/**
 * Fungsi untuk mengambil semua data siswa dari Firestore
 * @returns {Promise<Array>} Sebuah array berisi objek data siswa
 */
export const getAllStudents = async () => {
  try {
    const data = await getDocs(studentCollectionRef);
    // Kita map datanya untuk mendapatkan ID dokumen dan data field-nya
    const students = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return students;
  } catch (error) {
    console.error("Error mengambil data siswa:", error);
    // Kembalikan array kosong jika terjadi error
    return [];
  }
};