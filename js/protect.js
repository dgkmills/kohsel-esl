// Imports from our local firebase-init.js
import { auth, db, doc, getDoc, onAuthStateChanged } from './firebase-init.js';

// Function to check user's role from Firestore
async function checkUserRole(user) {
  if (!user) return 'user'; // Not logged in, default role
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.role || 'user'; // Return role or default to 'user'
    } else {
      console.log("User document doesn't exist yet for UID:", user.uid);
      // Optional: Create the user document here if needed, perhaps with default role 'user'
      // await setDoc(userDocRef, { email: user.email, role: 'user', createdAt: serverTimestamp() });
      return 'user';
    }
  } catch (error) {
    console.error("Error fetching user role for UID", user.uid, ":", error);
    return 'user'; // Default to 'user' on error
  }
}

onAuthStateChanged(auth, async (user) => {
  const dashboardNav = document.getElementById('dashboard-nav-link');
  // Check if current page path ends with dashboard.html
  const isDashboardPage = window.location.pathname.endsWith('dashboard.html'); 

  if (user) {
    // User is logged in. Check their role.
    const role = await checkUserRole(user);
    
    if (role === 'admin') {
      // User is an admin
      console.log(`Auth state: Logged in as ADMIN (User: ${user.uid})`);
      if (dashboardNav) dashboardNav.style.display = 'block'; // Show Dashboard link
    } else {
      // User is a regular user (student)
      console.log(`Auth state: Logged in as USER (User: ${user.uid})`);
      if (dashboardNav) dashboardNav.style.display = 'none'; // Ensure Dashboard link is hidden
      
      // If they are NOT admin and try to access dashboard, redirect them to home
      if (isDashboardPage) {
        console.log("Non-admin user attempting to access dashboard. Redirecting.");
        window.location.replace('index.html'); // Redirect non-admins away from dashboard
        return; // Stop further execution for this page load
      }
    }
    
    // If we haven't redirected, show the page content
    document.body.style.display = 'block';

  } else {
    // User is not logged in. Redirect to login.html.
    console.log("Auth state: Not logged in, redirecting to login...");
    
    // Only redirect if NOT already on the login page
    if (!window.location.pathname.endsWith('login.html')) {
       window.location.replace('login.html'); // Use relative path
    } else {
       // If already on login page, make sure it's visible
       document.body.style.display = 'flex'; // Use flex for login page wrapper
    }
  }
});

