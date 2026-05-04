import { auth } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const authErrorMsg = document.getElementById('auth-error-msg');

// Helper to show errors
const showError = (message) => {
    if(authErrorMsg) {
        authErrorMsg.textContent = message;
        authErrorMsg.style.display = 'block';
    }
};

// Signup Logic
if(signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            window.location.href = 'index.html'; // Redirect to home
        } catch (error) {
            showError(error.message);
        }
    });
}

// Login Logic
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'index.html'; // Redirect to home
        } catch (error) {
            showError("Invalid email or password");
        }
    });
}

// Logout Logic
if(logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Error signing out:", error);
        }
    });
}

// Auth State Observer - Redirect unauthenticated users
onAuthStateChanged(auth, (user) => {
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    
    if (user) {
        // User is signed in
        if (isAuthPage) {
            window.location.href = 'index.html'; // Redirect authenticated users away from auth pages
        }
        // Expose user ID globally for app.js to use
        window.currentUserId = user.uid; 
    } else {
        // No user is signed in
        if (!isAuthPage) {
            window.location.href = 'login.html'; // Redirect unauthenticated users to login
        }
    }
});
