import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6gIZDejpD1hL8ijdFCV7kyOuqQc_mlUQ",
  authDomain: "smartcampus-af2c6.firebaseapp.com",
  databaseURL: "https://smartcampus-af2c6-default-rtdb.firebaseio.com",
  projectId: "smartcampus-af2c6",
  storageBucket: "smartcampus-af2c6.firebasestorage.app",
  messagingSenderId: "468963735996",
  appId: "1:468963735996:web:b3431f2ecd8d07dc9e93b9",
  measurementId: "G-B82FQLTQEN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, db, analytics };
