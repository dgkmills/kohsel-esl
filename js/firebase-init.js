// Firebase v10 SDK (Modular) Imports
// These pull the code from the Firebase CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// AUTH IMPORTS
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// FIRESTORE IMPORTS
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp,
  collection,  // NEW: For querying collections
  query,       // NEW: For creating queries
  getDocs,     // NEW: For fetching multiple documents
  getDoc       // NEW: For fetching a single document
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- YOUR ACTION REQUIRED ---
// Paste your Firebase config object here.
const firebaseConfig = {
  apiKey: "AIzaSyBpxxW0GeGM21IBgBsmWvUWW5ZChwNm8Hk",
  authDomain: "kohsel-esl.firebaseapp.com",
  projectId: "kohsel-esl",
  storageBucket: "kohsel-esl.appspot.com", // Corrected domain
  messagingSenderId: "458143607307",
  appId: "1:458143607307:web:4bd36c1153031a53aa750e"
};
// ----------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export all the functions we need
export { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  getDocs,
  getDoc
};

