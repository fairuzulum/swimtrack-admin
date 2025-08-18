import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

/**
 * Mengirim email reset password ke alamat email yang diberikan.
 * @param {string} email Alamat email pengguna.
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // Melempar error kembali agar bisa ditangkap oleh komponen UI
    throw new Error(error.code); 
  }
};