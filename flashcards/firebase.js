// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZJtKa8xmpi7uokM9YYWHAtM5q_pQY9sQ",
  authDomain: "flashcard-423ca.firebaseapp.com",
  projectId: "flashcard-423ca",
  storageBucket: "flashcard-423ca.appspot.com",
  messagingSenderId: "1026812925744",
  appId: "1:1026812925744:web:b78bd56444d95576e55af5",
  measurementId: "G-7QVRB6515N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);