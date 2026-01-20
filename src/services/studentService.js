import * as XLSX from 'xlsx';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, runTransaction, query, where, orderBy, limit, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { detectClassFromTime } from '../utils/classUtils';

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


/**
 * ===============================================================
 * FUNGSI BARU UNTUK UPDATE SESI SECARA MANUAL
 * ===============================================================
 * @param {string} studentId - ID dokumen siswa.
 * @param {number} newSessionCount - Jumlah sesi baru.
 */
export const updateStudentSessions = async (studentId, newSessionCount) => {
  try {
    const studentDoc = doc(db, "students", studentId);
    // Menggunakan updateDoc untuk mengubah satu field spesifik
    await updateDoc(studentDoc, {
      remainingSessions: newSessionCount
    });
  } catch (error) {
    console.error("Error mengupdate pertemuan siswa:", error);
    throw new Error("Gagal mengupdate pertemuan siswa.");
  }
};


/**
 * ===============================================================
 * FUNGSI BARU UNTUK VALIDASI ABSENSI HARIAN
 * ===============================================================
 * Mengecek apakah seorang siswa sudah diabsen pada hari ini.
 * @param {string} studentId - ID dokumen siswa.
 * @returns {Promise<boolean>} - Mengembalikan true jika sudah absen, false jika belum.
 */
export const checkIfStudentAttendedToday = async (studentId) => {
  try {
    const today = new Date();
    // Set waktu ke awal hari (00:00:00)
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    // Set waktu ke akhir hari (23:59:59)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const attendanceRef = collection(db, "students", studentId, "attendances");
    
    // Buat query untuk mencari absensi di rentang waktu hari ini
    const q = query(
      attendanceRef,
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<=", Timestamp.fromDate(endOfDay)),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    // Jika ada dokumen yang ditemukan, berarti sudah absen
    return !querySnapshot.empty;

  } catch (error) {
    console.error("Error mengecek absensi hari ini:", error);
    // Jika terjadi error, kita anggap belum absen agar tidak menghalangi
    return false; 
  }
};


/**
 * ===============================================================
 * FUNGSI BARU UNTUK BACKUP & RESTORE
 * ===============================================================
 */

/**
 * Mengekspor semua data member termasuk riwayat pembayaran dan absensi.
 * @returns {Promise<Object>} Objek JSON yang berisi semua data.
 */
export const exportAllData = async () => {
  const studentsSnapshot = await getDocs(collection(db, "students"));
  const backupData = [];

  for (const studentDoc of studentsSnapshot.docs) {
    const studentData = { ...studentDoc.data(), id: studentDoc.id };
    
    // Ambil sub-collection payments
    const paymentsSnapshot = await getDocs(collection(db, "students", studentDoc.id, "payments"));
    studentData.payments = paymentsSnapshot.docs.map(doc => doc.data());
    
    // Ambil sub-collection attendances
    const attendancesSnapshot = await getDocs(collection(db, "students", studentDoc.id, "attendances"));
    studentData.attendances = attendancesSnapshot.docs.map(doc => doc.data());
    
    backupData.push(studentData);
  }
  return { version: "1.0", createdAt: new Date().toISOString(), students: backupData };
};

/**
 * Mengimpor data dari file backup. INI AKAN MENGHAPUS SEMUA DATA LAMA.
 * @param {Array} studentsData - Array data siswa dari file JSON.
 */
export const importAllData = async (studentsData) => {
  // Peringatan Keamanan: Fungsi ini sangat destruktif.
  // Pertama, hapus semua dokumen yang ada di koleksi 'students'.
  const existingStudents = await getDocs(collection(db, "students"));
  const deleteBatch = writeBatch(db);
  existingStudents.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();

  // Kedua, impor data baru menggunakan batch write untuk efisiensi.
  const importBatch = writeBatch(db);
  studentsData.forEach(student => {
    // Buat referensi dokumen baru (Firebase akan generate ID baru)
    const studentRef = doc(collection(db, "students"));
    
    // Ambil data siswa utama tanpa sub-collection
    const { payments, attendances, id, ...mainStudentData } = student;
    importBatch.set(studentRef, mainStudentData);
    
    // Impor sub-collection payments
    if (payments && payments.length > 0) {
      payments.forEach(payment => {
        // Firestore butuh object Date, bukan string/timestamp dari JSON
        const paymentData = { ...payment, date: new Date(payment.date.seconds * 1000) };
        const paymentRef = doc(collection(studentRef, "payments"));
        importBatch.set(paymentRef, paymentData);
      });
    }

    // Impor sub-collection attendances
    if (attendances && attendances.length > 0) {
      attendances.forEach(attendance => {
        const attendanceData = { ...attendance, date: new Date(attendance.date.seconds * 1000) };
        const attendanceRef = doc(collection(studentRef, "attendances"));
        importBatch.set(attendanceRef, attendanceData);
      });
    }
  });

  // Commit semua operasi tulis sekaligus
  await importBatch.commit();
};


// ===============================================================
// FUNGSI BARU UNTUK EXPORT & IMPORT EXCEL
// ===============================================================

/**
 * Mengambil data siswa dan mengubahnya menjadi format workbook Excel.
 * @returns {Promise<XLSX.WorkBook>}
 */
export const exportStudentsToExcel = async () => {
  const studentsSnapshot = await getDocs(studentCollectionRef);
  const studentsData = studentsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      "Nama Lengkap": data.name,
      "Nama Panggilan": data.nickname || "",
      "Sisa Pertemuan": data.remainingSessions || 0,
    };
  });

  if (studentsData.length === 0) {
    throw new Error("Tidak ada data member untuk diekspor.");
  }

  // Buat worksheet dari data JSON
  const ws = XLSX.utils.json_to_sheet(studentsData);
  // Buat workbook baru
  const wb = XLSX.utils.book_new();
  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws, "Daftar Member");

  return wb;
};

/**
 * Membaca file Excel dan memperbarui data siswa di Firestore.
 * @param {File} file - File Excel yang diunggah pengguna.
 * @returns {Promise<number>} Jumlah siswa yang berhasil diupdate.
 */
export const importStudentsFromExcel = async (file) => {
  return new Promise(async (resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          return reject(new Error("File Excel kosong atau format tidak sesuai."));
        }

        // Ambil semua siswa yang ada di database
        const existingStudentsSnapshot = await getDocs(studentCollectionRef);
        const existingStudentsMap = new Map();
        existingStudentsSnapshot.forEach(doc => {
          existingStudentsMap.set(doc.data().name.toLowerCase().trim(), doc.id);
        });

        const batch = writeBatch(db);
        let updatedCount = 0;

        json.forEach(row => {
          const name = row["Nama Lengkap"];
          const nickname = row["Nama Panggilan"];
          const remainingSessions = row["Sisa Pertemuan"];

          if (name && typeof name === 'string') {
            const studentId = existingStudentsMap.get(name.toLowerCase().trim());
            if (studentId) {
              const studentRef = doc(db, "students", studentId);
              const updateData = {};
              if (nickname !== undefined) {
                updateData.nickname = nickname;
              }
              if (remainingSessions !== undefined && !isNaN(parseInt(remainingSessions))) {
                updateData.remainingSessions = parseInt(remainingSessions);
              }

              if (Object.keys(updateData).length > 0) {
                 batch.update(studentRef, updateData);
                 updatedCount++;
              }
            }
          }
        });

        if (updatedCount === 0) {
          return reject(new Error("Tidak ada nama member di Excel yang cocok dengan data di database."));
        }

        await batch.commit();
        resolve(updatedCount);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};


export const getStudentClassStats = async (startDate, endDate) => {
  try {
    const studentCollectionRef = collection(db, "students"); //
    const studentsSnapshot = await getDocs(studentCollectionRef);
    const stats = [];

    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = { ...studentDoc.data(), id: studentDoc.id };
      const attendanceRef = collection(db, "students", studentDoc.id, "attendances"); //
      
      let q;
      if (startDate && endDate) {
        q = query(
          attendanceRef,
          where("date", ">=", Timestamp.fromDate(startDate)),
          where("date", "<=", Timestamp.fromDate(endDate))
        );
      } else {
        q = query(attendanceRef);
      }
      
      const attDocs = await getDocs(q);
      
      // counts untuk jumlah, history untuk detail jam
      const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, J: 0, X: 0 };
      const history = { A: [], B: [], C: [], D: [], E: [], F: [], J: [], X: [] };
      
      attDocs.forEach(doc => {
        const d = doc.data().date.toDate();
        const classId = detectClassFromTime(d);
        if (classId) {
          counts[classId]++;
          history[classId].push(d); // Simpan object Date
        }
      });

      stats.push({
        ...studentData,
        classCounts: counts,
        classHistory: history,
        totalInPeriod: attDocs.size
      });
    }
    return stats;
  } catch (error) {
    console.error("Gagal ambil statistik:", error);
    return [];
  }
};