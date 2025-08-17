import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, runTransaction, query, where, orderBy, limit } from "firebase/firestore";
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



/**
 * ===============================================================
 * FUNGSI BARU UNTUK ABSENSI & PEMBAYARAN
 * ===============================================================
 */

/**
 * Mengambil data satu siswa berdasarkan ID.
 * @param {string} studentId - ID dokumen siswa.
 * @returns {Promise<Object>} Data siswa.
 */
export const getStudentById = async (studentId) => {
  try {
    const studentDoc = doc(db, "students", studentId);
    const docSnap = await getDocs(query(collection(db, "students"), where("__name__", "==", studentId)));
    if (!docSnap.empty) {
        return { ...docSnap.docs[0].data(), id: docSnap.docs[0].id };
    } else {
        throw new Error("Siswa tidak ditemukan");
    }
  } catch (error) {
    console.error("Error mengambil data siswa by ID:", error);
    throw error;
  }
};


/**
 * Memproses absensi siswa, mengurangi sesi, dan mencatat riwayat.
 * Mengizinkan sesi menjadi negatif.
 * @param {string} studentId - ID dokumen siswa.
 */
export const processAttendance = async (studentId) => {
  const studentRef = doc(db, "students", studentId);
  try {
    await runTransaction(db, async (transaction) => {
      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists()) {
        throw new Error("Siswa tidak ada!");
      }
      const currentSessions = studentDoc.data().remainingSessions;
      const newSessions = currentSessions - 1;
      transaction.update(studentRef, { remainingSessions: newSessions });

      const attendanceRef = doc(collection(db, "students", studentId, "attendances"));
      transaction.set(attendanceRef, { date: new Date() });
    });
  } catch (error) {
    console.error("Error memproses absensi:", error);
    throw error;
  }
};

/**
 * Memproses pembayaran, menambah sesi, dan mencatat riwayat.
 * @param {string} studentId - ID siswa.
 * @param {number} amount - Jumlah pembayaran.
 */
export const processPayment = async (studentId, amount) => {
    const studentRef = doc(db, "students", studentId);
    const sessionsToAdd = (amount / 250000) * 4;
    if (sessionsToAdd <= 0) throw new Error("Jumlah pembayaran tidak valid");
    
    try {
        await runTransaction(db, async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists()) throw new Error("Siswa tidak ada!");

            const currentSessions = studentDoc.data().remainingSessions;
            const newSessions = currentSessions + sessionsToAdd;
            transaction.update(studentRef, { remainingSessions: newSessions });

            const paymentRef = doc(collection(db, "students", studentId, "payments"));
            transaction.set(paymentRef, {
                amount: amount,
                sessionsAdded: sessionsToAdd,
                date: new Date()
            });
        });
    } catch (error) {
        console.error("Error memproses pembayaran:", error);
        throw error;
    }
};


/**
 * Mengambil riwayat absensi seorang siswa.
 * @param {string} studentId - ID siswa.
 * @returns {Promise<Array>} Daftar riwayat absensi.
 */
export const getAttendanceHistory = async (studentId) => {
    try {
        const attendanceRef = collection(db, "students", studentId, "attendances");
        const q = query(attendanceRef, orderBy("date", "desc"));
        const data = await getDocs(q);
        return data.docs.map(doc => ({...doc.data(), id: doc.id}));
    } catch (error) {
        console.error("Error mengambil riwayat absensi:", error);
        return [];
    }
};

/**
 * Mengambil riwayat pembayaran seorang siswa.
 * @param {string} studentId - ID siswa.
 * @returns {Promise<Array>} Daftar riwayat pembayaran.
 */
export const getPaymentHistory = async (studentId) => {
    try {
        const paymentsRef = collection(db, "students", studentId, "payments");
        const q = query(paymentsRef, orderBy("date", "desc"));
        const data = await getDocs(q);
        return data.docs.map(doc => ({...doc.data(), id: doc.id}));
    } catch (error) {
        console.error("Error mengambil riwayat pembayaran:", error);
        return [];
    }
};