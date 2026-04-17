import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // IMPORTANT: Replace the empty strings below with your actual Firebase config keys.
  // You can find these in your Firebase Console -> Project Settings -> General -> Your apps (Web App)
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "smartcampus-af2c6.firebaseapp.com",
  databaseURL: "https://smartcampus-af2c6-default-rtdb.firebaseio.com/",
  projectId: "smartcampus-af2c6",
  storageBucket: "smartcampus-af2c6.firebasestorage.app",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, db };
