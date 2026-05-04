import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Replace this with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDy6aG2m8OmGyCFV750t3G8nvTL96oHofs",
  authDomain: "activity-recommender-1b61c.firebaseapp.com",
  projectId: "activity-recommender-1b61c",
  storageBucket: "activity-recommender-1b61c.firebasestorage.app",
  messagingSenderId: "386511206262",
  appId: "1:386511206262:web:bfbbe4442968d008476c57",
  measurementId: "G-BKWT75DRBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
