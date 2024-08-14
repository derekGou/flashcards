import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai-flashcards-bbeea.firebaseapp.com",
  projectId: "ai-flashcards-bbeea",
  storageBucket: "ai-flashcards-bbeea.appspot.com",
  messagingSenderId: "345192431204",
  appId: "1:345192431204:web:9add3543b868feff9e971",
  measurementId: "G-BQPW9EH1D4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };