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



/**
 * ===============================================================
 * FUNGSI BARU UNTUK MENGAMBIL LAPORAN KEUANGAN LENGKAP
 * ===============================================================
 * Mengambil semua siswa, lalu mengambil riwayat pembayaran dari setiap siswa,
 * dan menggabungkannya menjadi satu laporan.
 * @returns {Promise<Array>} Laporan yang berisi { studentName, totalAmount }
 */
export const getFinancialReport = async () => {
  try {
    // 1. Ambil semua data siswa terlebih dahulu
    const studentsSnapshot = await getDocs(studentCollectionRef);
    const students = studentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // 2. Gunakan Promise.all untuk mengambil semua data pembayaran secara paralel (lebih cepat)
    const allPaymentsPromises = students.map(student => {
      const paymentsCollectionRef = collection(db, "students", student.id, "payments");
      return getDocs(paymentsCollectionRef);
    });

    const allPaymentsSnapshots = await Promise.all(allPaymentsPromises);

    // 3. Proses dan gabungkan data
    const financialReport = students.map((student, index) => {
      const paymentsSnapshot = allPaymentsSnapshots[index];
      const payments = paymentsSnapshot.docs.map(doc => doc.data());
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        studentName: student.name,
        totalAmount,
      };
    }).filter(report => report.totalAmount > 0) // Hanya tampilkan siswa yang pernah bayar
      .sort((a, b) => b.totalAmount - a.totalAmount); // Urutkan dari pemasukan terbesar

    return financialReport;

  } catch (error) {
    console.error("Error mengambil laporan keuangan:", error);
    throw new Error("Gagal mengambil laporan keuangan dari server.");
  }
};