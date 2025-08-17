import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
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

export const registerStudent = async (studentData) => {
  try {
    await addDoc(studentCollectionRef, {
      name: studentData.name,
      nickname: studentData.nickname,
      remainingSessions: 0,
    });
  } catch (error) {
    console.error("Error mendaftarkan siswa:", error);
    throw new Error("Gagal menyimpan data siswa ke server.");
  }
};

/**
 * ===============================================================
 * FUNGSI BARU UNTUK UPDATE DATA SISWA
 * ===============================================================
 * @param {string} studentId - ID dokumen siswa yang akan diupdate
 * @param {Object} updatedData - Data baru (name, nickname)
 */
export const updateStudent = async (studentId, updatedData) => {
  try {
    const studentDoc = doc(db, "students", studentId);
    await updateDoc(studentDoc, updatedData);
  } catch (error) {
    console.error("Error mengupdate data siswa:", error);
    throw new Error("Gagal mengupdate data siswa.");
  }
};

/**
 * ===============================================================
 * FUNGSI BARU UNTUK MENGHAPUS DATA SISWA
 * ===============================================================
 * @param {string} studentId - ID dokumen siswa yang akan dihapus
 */
export const deleteStudent = async (studentId) => {
  try {
    const studentDoc = doc(db, "students", studentId);
    await deleteDoc(studentDoc);
  } catch (error) {
    console.error("Error menghapus siswa:", error);
    throw new Error("Gagal menghapus siswa.");
  }
};