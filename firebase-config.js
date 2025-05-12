// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDX6sTIe21nvSmTYux3PFVRMh13U-VSb-I",
  authDomain: "simpletodoappfirebase.firebaseapp.com",
  projectId: "simpletodoappfirebase",
  storageBucket: "simpletodoappfirebase.firebasestorage.app",
  messagingSenderId: "846448600348",
  appId: "1:846448600348:web:c1a7b2ce17097da2a606d9",
  measurementId: "G-ZW7LTJN6GV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
