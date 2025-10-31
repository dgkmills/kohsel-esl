// IMPORTS
// FIX: Corrected the import path to point to the 'js' folder
import { 
  db, 
  collection, 
  query, 
  getDocs, 
  // REMOVED: onAuthStateChanged,
  // REMOVED: auth,
  // REMOVED: getDoc,
  // REMOVED: doc
} from './js/firebase-init.js';

// --- REMOVED: getUserRole function ---
// This is now handled by protect.js before this script even runs.

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
      // *** FIX: Get email from parent doc (it might be undefined) ***
      const parentUserEmail = userData?.email; // This may be null for old users

      // 3. Get the 'quizAttempts' sub-collection for this user
      // This also requires the admin-only 'list' permission
      const quizAttemptsRef = collection(db, 'users', userDoc.id, 'quizAttempts');
      const quizAttemptsQuery = query(quizAttemptsRef);
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);

      quizAttemptsSnapshot.forEach(quizDoc => {
        const quizData = quizDoc.data();
        
        // *** THE FIX ***
        // Prioritize the email saved IN THE QUIZ DOCUMENT.
        // Fall back to the parent user doc email (for future use).
        // Fall back to UID if both are somehow missing.
        const displayEmail = quizData.userEmail || parentUserEmail || userDoc.id;

        allQuizAttempts.push({
          email: displayEmail, // This 'email' property will now be correct
          ...quizData
        });
      });
    }

    // *** NEW 4. Define emails to filter out ***
    const emailsToExclude = [
      'dan@myteacherdan.com', 
      'test@kohsel.com',
      'patcharee.mango@gmail.com' // Added this one I saw in your DB
    ];

    // *** NEW 5. Filter out excluded emails ***
    const filteredAttempts = allQuizAttempts.filter(attempt => {
      // 'attempt.email' is now the correct 'displayEmail' we calculated above
      return !emailsToExclude.includes(attempt.email);
    });

    // 6. Sort all *filtered* attempts by timestamp, newest first
    filteredAttempts.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    // 7. Populate the table
    if (filteredAttempts.length === 0) {
      loadingEl.textContent = "No quiz attempts found for students.";
      return;
    }

    tableBody.innerHTML = ''; // Clear the table
    // *** FIX: Iterate over filteredAttempts, not allQuizAttempts ***
    filteredAttempts.forEach(attempt => {
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

// --- NEW ---
// Call the function directly.
// The 'protect.js' script has already run and confirmed this user is an admin.
loadDashboardData();

