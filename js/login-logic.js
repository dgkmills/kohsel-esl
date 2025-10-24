// Imports from our local firebase-init.js
import { 
  auth, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from './firebase-init.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// 1. Redirect if already logged in
// This listener runs when the script loads AND when auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in. Check if we are on the login page.
    if (window.location.pathname.endsWith('login.html')) {
      console.log("Already logged in, redirecting from login page to index.html");
      window.location.href = 'index.html'; // Redirect from login page
    } else {
      // User is logged in, but not on the login page (protect.js handles showing content)
      console.log("Already logged in on a protected page.");
    }
  } else {
    // User is signed out.
    // If on the login page, make sure it's visible.
    if (window.location.pathname.endsWith('login.html')) {
      console.log("User is logged out. Showing login page.");
      document.body.style.display = 'flex'; // Use 'flex' for login-wrapper
    }
     // If on other pages, protect.js handles the redirect
  }
});

// 2. Handle login form submission
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none'; // Hide error on new attempt
    errorMessage.textContent = ''; // Clear previous message
    
    const email = emailInput.value.trim(); // Trim whitespace
    const password = passwordInput.value;
    
    // Basic validation
    if (!email || !password) {
        errorMessage.textContent = "Please enter both email and password.";
        errorMessage.style.display = 'block';
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("Login successful:", user.uid);
        // Redirect is now handled by the onAuthStateChanged listener above
        // No need to redirect here explicitly
      })
      .catch((error) => {
        const errorCode = error.code;
        let msg = "Login failed. Please check your credentials.";
        
        // Provide more specific error messages
        if (errorCode === 'auth/invalid-credential' || 
            errorCode === 'auth/wrong-password' || 
            errorCode === 'auth/user-not-found') {
          msg = "Invalid email or password.";
        } else if (errorCode === 'auth/invalid-email') {
          msg = "Please enter a valid email address.";
        } else if (errorCode === 'auth/too-many-requests') {
            msg = "Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.";
        }
        
        console.error("Login error:", errorCode, error.message);
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
      });
  });
} else {
    console.error("Login form not found!"); // Add error handling if form is missing
}

