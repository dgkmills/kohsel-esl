// IMPORTS
// FIX: Corrected the import path to point to the 'js' folder
import { 
  db, 
  collection, 
  query, 
  getDocs, 
  onAuthStateChanged, // Added auth import
  auth,               // Added auth import
  getDoc,             // Added getDoc import
  doc                 // Added doc import
} from './js/firebase-init.js';

// --- NEW: Role checking logic (moved from protect.js) ---
// We need this to ensure only admins can try to fetch all data.
async function getUserRole(user) {
  if (!user) return 'user';
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data().role || 'user';
    }
    return 'user';
  } catch (error) {
    console.error("Error fetching user role:", error);
    return 'user';
  }
}

// Function to load dashboard data
async function loadDashboardData() {
  const tableBody = document.getElementById('quiz-scores-body');
  const loadingEl = document.getElementById('dashboard-loading');
  
  if (!tableBody || !loadingEl) {
    console.error("Dashboard elements not found.");
    return;
  }

  try {
    // 1. Get all documents from the 'users' collection
    // This requires the admin-only 'list' permission from firestore.rules
    const usersCollectionRef = collection(db, 'users');
    const usersQuery = query(usersCollectionRef);
    const usersSnapshot = await getDocs(usersQuery);

    let allQuizAttempts = [];

    // 2. Loop through each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userEmail = userData?.email || userDoc.id; // Use email if available

      // 3. Get the 'quizAttempts' sub-collection for this user
      // This also requires the admin-only 'list' permission
      const quizAttemptsRef = collection(db, 'users', userDoc.id, 'quizAttempts');
      const quizAttemptsQuery = query(quizAttemptsRef);
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);

      quizAttemptsSnapshot.forEach(quizDoc => {
        const quizData = quizDoc.data();
        allQuizAttempts.push({
          email: userEmail, // Use the fetched email
          ...quizData
        });
      });
    }

    // 4. Sort all attempts by timestamp, newest first
    allQuizAttempts.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    // 5. Populate the table
    if (allQuizAttempts.length === 0) {
      loadingEl.textContent = "No quiz attempts found.";
      return;
    }

    tableBody.innerHTML = ''; // Clear the table
    allQuizAttempts.forEach(attempt => {
      const row = document.createElement('tr');
      
      const scoreClass = (attempt.score || 0) >= 80 ? 'pass' : 'fail';
      const date = attempt.timestamp ? new Date(attempt.timestamp.seconds * 1000).toLocaleString() : 'N/A';
      
      const quizName = attempt.quizName || 'N/A'; 
      
      row.innerHTML = `
        <td><span class="user-email">${attempt.email}</span></td>
        <td>${quizName}</td> 
        <td><span class="quiz-score ${scoreClass}">${attempt.score}%</span></td>
        <td>${date}</td>
      `;
      tableBody.appendChild(row);
    });

    loadingEl.style.display = 'none'; // Hide loading message

  } catch (error) {
    console.error("Error loading dashboard data: ", error);
    loadingEl.textContent = "Error loading data. Check console and Firestore rules.";
    loadingEl.style.color = 'red';
  }
}

// Auth listener to trigger data load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is logged in, check their role
    const role = await getUserRole(user);
    if (role === 'admin') {
      // Only load data if user is an admin
      loadDashboardData();
    } else {
      // This page should be protected by protect.js, but as a fallback:
      const loadingEl = document.getElementById('dashboard-loading');
      if (loadingEl) loadingEl.textContent = "Access denied. Admin required.";
    }
  }
  // If no user, protect.js should have already redirected to login.html
});
