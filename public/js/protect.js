// UPDATED: All imports now come from our local firebase-init.js
import { auth, onAuthStateChanged } from './firebase-init.js';

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in, show the page content.
    console.log("Auth state: Logged in (User: " + user.uid + ")");
    // This makes the page visible after auth check passes
    document.body.style.display = 'block'; 
  } else {
    // User is not logged in. Redirect to login.html.
    console.log("Auth state: Not logged in, redirecting...");
    // Redirect to the login page.
    // Use window.location.replace for a cleaner redirect (no "back" button history).
    window.location.replace('/login.html');
  }
});


