// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhb7YgBwhvuLJhPpBuGzvK5_fgeF-SoPg",
  authDomain: "clock-db8b5.firebaseapp.com",
  projectId: "clock-db8b5",
  storageBucket: "clock-db8b5.firebasestorage.app",
  messagingSenderId: "256590560938",
  appId: "1:256590560938:web:9355484ef68db8fbd1dad3",
  measurementId: "G-SQ00MK3XS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);