import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const studentCollectionRef = collection(db, "students");

export const getAllStudents = async () => {
  try {
    const data = await getDocs(studentCollectionRef);
    const students = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return students;
  } catch (error) {
    console.error("Error mengambil data siswa:", error);
    return [];
  }
};

/**
 * ===============================================================
 * FUNGSI BARU UNTUK MENDAFTARKAN SISWA
 * ===============================================================
 * @param {Object} studentData - Data siswa baru (name, nickname)
 * @returns {Promise}
 */
export const registerStudent = async (studentData) => {
  try {
    // Menambahkan data baru ke koleksi 'students'
    // Sisa sesi (remainingSessions) otomatis diatur ke 0
    await addDoc(studentCollectionRef, {
      name: studentData.name,
      nickname: studentData.nickname,
      remainingSessions: 0,
    });
  } catch (error) {
    console.error("Error mendaftarkan siswa:", error);
    // Melemparkan error kembali agar bisa ditangkap oleh UI
    throw new Error("Gagal menyimpan data siswa ke server.");
  }
};