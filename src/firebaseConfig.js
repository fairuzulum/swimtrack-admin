// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCPu3dvISBCMlX0i4mux3U0Czz1LNCoHQ",
  authDomain: "absenrenang.firebaseapp.com",
  projectId: "absenrenang",
  storageBucket: "absenrenang.firebasestorage.app",
  messagingSenderId: "875422246582",
  appId: "1:875422246582:web:21fa05ce18cafc614fe817"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);