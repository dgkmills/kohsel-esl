// Import Firebase services
// *** MODIFIED: Added doc, setDoc, serverTimestamp ***
import { auth, db, doc, setDoc, serverTimestamp } from './firebase-init.js';
// Import Auth functions
import {
    signInWithEmailAndPassword,
    // createUserWithEmailAndPassword, // Removed - No sign up
    onAuthStateChanged,
    sendPasswordResetEmail // Added for Forgot Password
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Get elements from the HTML
const loginButton = document.getElementById('loginButton');
// const signupButton = document.getElementById('signupButton'); // Removed
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const messageArea = document.getElementById('messageArea'); // Renamed from errorMessage
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// --- Helper Functions for User Feedback ---
function showMessage(message, isError = false) {
    if(messageArea) {
        messageArea.textContent = message;
        messageArea.className = isError ? 'errorMessage' : 'successMessage'; // Use classes for styling
         // Apply basic styles directly for visibility, complement with CSS classes
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
        
        // *** NEW: Add logic to create/update user doc on login ***
        const user = userCredential.user;
        if (user) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            // Use { merge: true } to create the doc if it doesn't exist,
            // or update it if it does. This will NOT overwrite the 'role' field
            // if it already exists (e.g., as 'admin').
            await setDoc(userDocRef, {
              email: user.email,
              lastLogin: serverTimestamp()
            }, { merge: true });
            console.log(`User document for ${user.uid} created/updated.`);
          } catch (docError) {
            console.error("Error saving user document:", docError);
          }
        }
        // *** END NEW LOGIC ***

        // Redirect to the main index page. protect.js handles role-based access.
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Login Error: ", error);
        // Provide a generic error for incorrect credentials
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

// 1. LOGIN BUTTON CLICK
if (loginButton && emailField && passwordField) {
    loginButton.addEventListener('click', handleLogin);
} else {
     console.error("Login button or input fields not found.");
}

// 2. ENTER KEY in Password Field
if (passwordField) {
    passwordField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission (if it was a form)
            handleLogin(); // Trigger the login function
        }
    });
}

// 3. FORGOT PASSWORD LINK CLICK
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        handlePasswordReset();
    });
} else {
    console.error("Forgot Password link not found.");
}

// 4. SIGN UP BUTTON LISTENER (Removed)
// The signupButton variable and its event listener block have been removed.

// 5. AUTH STATE OBSERVER (Redirect if already logged in)
onAuthStateChanged(auth, (user) => {
    // If user is logged in and they are somehow on the login page, redirect them
    if (user && window.location.pathname.endsWith('login.html')) {
        console.log("User already logged in, redirecting to index page.");
        window.location.href = 'index.html';
    }
});

