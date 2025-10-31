// IMPORTS
import { 
  db, 
  collection, 
  query, 
  getDocs, 
} from './js/firebase-init.js';

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

    // 2. Loop through each user doc in the 'users' collection
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      // Get the email from the parent user doc (if it exists)
      const parentUserEmail = userData?.email; 

      // 3. Get the 'quizAttempts' sub-collection for this user
      // This also requires the admin-only 'list' permission
      const quizAttemptsRef = collection(db, 'users', userDoc.id, 'quizAttempts');
      const quizAttemptsQuery = query(quizAttemptsRef);
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);

      // 4. Loop through each quiz attempt for that user
      quizAttemptsSnapshot.forEach(quizDoc => {
        const quizData = quizDoc.data();
        
        // --- THIS IS THE CRITICAL FIX ---
        // Use the email saved IN THE QUIZ DOC first.
        // Fall back to the parent user doc's email.
        // Fall back to the user's ID if no email is found anywhere.
        const displayEmail = quizData.userEmail || parentUserEmail || userDoc.id;

        allQuizAttempts.push({
          email: displayEmail, // Use the correct email
          ...quizData
        });
      });
    }

    // 5. Define emails to filter OUT of the dashboard
    const emailsToExclude = [
      'dan@myteacherdan.com', 
      'test@kohsel.com',
      'patcharee.mango@gmail.com' // Example test account
    ];

    // 6. Filter the list to remove test/admin accounts
    const filteredAttempts = allQuizAttempts.filter(attempt => {
      // 'attempt.email' is now the correct 'displayEmail'
      return !emailsToExclude.includes(attempt.email);
    });

    // 7. Sort all *filtered* attempts by timestamp, newest first
    filteredAttempts.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    // 8. Populate the table
    if (filteredAttempts.length === 0) {
      loadingEl.textContent = "No quiz attempts found for students.";
      return;
    }

    tableBody.innerHTML = ''; // Clear the table
    // Iterate over the filtered list
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

// Call the function directly.
// protect.js has already confirmed this user is an admin.
loadDashboardData();
