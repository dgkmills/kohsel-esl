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
            // Successful login, redirect to dashboard
            window.location.href = 'dashboard.html'; 
        } catch (error) {
            console.error("Login Error: ", error);
            showError("Login failed. Please check your email and password.");
        }
    });
}

// 2. SIGN UP BUTTON LISTENER (This was missing)
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
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                joinedDate: new Date()
            });
            
            console.log("User document created in Firestore.");

            // Redirect to dashboard after successful signup
            window.location.href = 'dashboard.html';
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
        console.log("User already logged in, redirecting to dashboard.");
        window.location.href = 'dashboard.html';
    }
});
