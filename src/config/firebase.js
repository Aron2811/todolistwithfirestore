// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import{getAuth, GoogleAuthProvider} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXSYtIPWZs6viEaC7tHaFzH9zkxcaNBP8",
  authDomain: "todolist-8c02d.firebaseapp.com",
  projectId: "todolist-8c02d",
  storageBucket: "todolist-8c02d.firebasestorage.app",
  messagingSenderId: "986039026704",
  appId: "1:986039026704:web:c74162f173ad002db2b695",
  measurementId: "G-61XC4Q9S20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);