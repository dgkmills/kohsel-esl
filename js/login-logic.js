// Import Firebase services (path is correct)
import { auth, db } from './firebase-init.js';
// Import Auth functions
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Import Firestore functions
import { 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Get elements from the HTML
const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signupButton');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');

// Hide error message function
function hideError() {
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
}

// Show error message function
function showError(message) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
}

// 1. LOGIN BUTTON LISTENER
if (loginButton) {
    loginButton.addEventListener('click', async () => {
        hideError();
        const email = emailField.value;
        const password = passwordField.value;

        if (!email || !password) {
            showError("Please enter both email and password.");
            return;
        }

        try {
            console.log("Attempting to sign in...");
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Sign in successful!");
            
            // --- FIX ---
            // Redirect to the main index page.
            // The protect.js script will show admins the 'Dashboard' link,
            // so they can navigate there. This avoids redirecting non-admins
            // to a page they can't view.
            window.location.href = 'index.html'; 
            // --- END FIX ---

        } catch (error) {
            console.error("Login Error: ", error);
            showError("Login failed. Please check your email and password.");
        }
    });
}

// 2. SIGN UP BUTTON LISTENER
if (signupButton) {
    signupButton.addEventListener('click', async () => {
        hideError();
        const email = emailField.value;
        const password = passwordField.value;

        if (!email || !password) {
            showError("Please enter both email and password to sign up.");
            return;
        }

        try {
            console.log("Attempting to sign up...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log("User created successfully:", user.uid);

            // Create a document in the 'users' collection for this new user
            // Set a default role of 'user'
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: 'user', // Explicitly set default role
                joinedDate: new Date()
            });
            
            console.log("User document created in Firestore.");

            // --- FIX ---
            // Redirect to the main index page after signup as well.
            window.location.href = 'index.html';
            // --- END FIX ---

        } catch (error) {
            console.error("Sign Up Error: ", error);
            if (error.code === 'auth/email-already-in-use') {
                showError("This email is already in use. Please try logging in.");
            } else if (error.code === 'auth/weak-password') {
                showError("Password is too weak. Please use at least 6 characters.");
            } else {
                showError("Sign up failed. Please try again.");
            }
        }
    });
}

// 3. AUTH STATE OBSERVER (Redirect if already logged in)
onAuthStateChanged(auth, (user) => {
    // If user is logged in and they are on the login page, redirect them
    if (user && window.location.pathname.includes('login.html')) {
        console.log("User already logged in, redirecting to index page.");
        
        // --- FIX ---
        // Redirect to index.html, not dashboard.html
        window.location.href = 'index.html';
        // --- END FIX ---
    }
});
