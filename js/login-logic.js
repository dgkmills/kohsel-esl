// Import Firebase services
import { auth, db, doc, setDoc, serverTimestamp } from './firebase-init.js';
// Import Auth functions
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Get elements from the HTML
const loginButton = document.getElementById('loginButton');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const messageArea = document.getElementById('messageArea'); 
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// --- Helper Functions for User Feedback ---
function showMessage(message, isError = false) {
    if(messageArea) {
        messageArea.textContent = message;
        messageArea.className = isError ? 'errorMessage' : 'successMessage';
        messageArea.style.display = 'block';
        messageArea.style.marginTop = '1rem';
        messageArea.style.padding = '0.75rem 1rem';
        messageArea.style.borderRadius = '0.375rem';
        messageArea.style.textAlign = 'left';
        messageArea.style.fontSize = '0.875rem';
        if (isError) {
            messageArea.style.color = '#991b1b'; // text-red-800
            messageArea.style.backgroundColor = '#fee2e2'; // bg-red-100
            messageArea.style.border = '1px solid #fecaca'; // border-red-200
        } else {
             messageArea.style.color = '#047857'; // text-green-700
             messageArea.style.backgroundColor = '#d1fae5'; // bg-green-100
             messageArea.style.border = '1px solid #a7f3d0'; // border-green-200
        }
    } else {
        console.error("Message area element not found. Message:", message);
    }
}

function hideMessage() {
    if(messageArea) {
        messageArea.style.display = 'none';
        messageArea.textContent = '';
    }
}

// --- Login Function ---
async function handleLogin() {
    hideMessage();
    const email = emailField.value;
    const password = passwordField.value;

    if (!email || !password) {
        showMessage("Please enter both email and password.", true);
        return;
    }

    try {
        console.log("Attempting to sign in...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Sign in successful!");
        
        // --- THIS IS THE FIX ---
        // On successful login, create or update their user document in the 'users' collection.
        // This makes them "visible" to the dashboard query.
        const user = userCredential.user;
        if (user) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            // Use { merge: true } to create doc if it doesn't exist,
            // or update 'lastLogin' if it does.
            // This will NOT overwrite an existing 'role' field (like 'admin').
            await setDoc(userDocRef, {
              email: user.email,
              lastLogin: serverTimestamp()
            }, { merge: true });
            console.log(`User document for ${user.uid} created/updated.`);
          } catch (docError) {
            console.error("Error saving user document:", docError);
          }
        }
        // --- END FIX ---

        // Redirect to the main index page.
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Login Error: ", error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
             showMessage("Login failed. Please check your email and password.", true);
        } else {
             showMessage("An unexpected error occurred. Please try again.", true);
        }
    }
}

// --- Password Reset Function ---
async function handlePasswordReset() {
    hideMessage();
    const email = emailField.value;

    if (!email) {
        showMessage("Please enter your email address above to reset password.", true);
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage(`Password reset email sent to ${email}. Check your inbox (and spam folder).`);
    } catch (error) {
        console.error("Password Reset Error:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
            showMessage("Could not send reset email. Please check the email address.", true);
        } else {
            showMessage("An error occurred trying to send the password reset email.", true);
        }
    }
}


// --- Event Listeners ---
if (loginButton && emailField && passwordField) {
    loginButton.addEventListener('click', handleLogin);
} else {
     console.error("Login button or input fields not found.");
}

if (passwordField) {
    passwordField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            handleLogin(); 
        }
    });
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault(); 
        handlePasswordReset();
    });
} else {
    console.error("Forgot Password link not found.");
}

onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith('login.html')) {
        console.log("User already logged in, redirecting to index page.");
        window.location.href = 'index.html';
    }
});
