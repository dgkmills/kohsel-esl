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
    const usersCollectionRef = collection(db, 'users');
    const usersQuery = query(usersCollectionRef);
    const usersSnapshot = await getDocs(usersQuery);

    let allQuizAttempts = [];

    // 2. Loop through each user doc in the 'users' collection
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const parentUserEmail = userData?.email; 

      // 3. Get the 'quizAttempts' sub-collection for this user
      const quizAttemptsRef = collection(db, 'users', userDoc.id, 'quizAttempts');
      const quizAttemptsQuery = query(quizAttemptsRef);
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);

      // 4. Loop through each quiz attempt for that user
      quizAttemptsSnapshot.forEach(quizDoc => {
        const quizData = quizDoc.data();
        const displayEmail = quizData.userEmail || parentUserEmail || userDoc.id;

        allQuizAttempts.push({
          email: displayEmail, 
          ...quizData
        });
      });
    }

    // --- NEW LOGIC: Filter for Highest Score ---
    // This reduces the list to only the BEST attempt for each user + quiz combo.
    const highestScores = new Map();
    
    allQuizAttempts.forEach(attempt => {
      // Create a unique key for each "user-quiz" pair
      const key = `${attempt.email}|${attempt.quizId}`;
      
      // If we haven't seen this combo, or if the new score is higher, save it.
      if (!highestScores.has(key) || (attempt.score || 0) > (highestScores.get(key).score || 0)) {
        highestScores.set(key, attempt);
      }
    });
    
    // Convert the Map of highest scores back into an array
    const highestAttemptsList = Array.from(highestScores.values());
    // --- END NEW LOGIC ---

    // 5. Define emails to filter OUT of the dashboard
    const emailsToExclude = [
      'dan@myteacherdan.com', // Admin account
      'test@kohsel.com',      // Test account
    ];

    // 6. Filter the list to remove test/admin accounts
    console.log("All highest attempts found:", highestAttemptsList);
    
    // --- NOTE: The filter is still commented out for testing ---
    // This lets you see ALL highest scores (including your admin scores)
    // to confirm the fix is working.
    const filteredAttempts = highestAttemptsList; // Use the new 'highest' list
    
    /* // --- UNCOMMENT THIS BLOCK LATER to hide admin/test scores ---
    const filteredAttempts = highestAttemptsList.filter(attempt => {
      // 'attempt.email' is now the correct 'displayEmail'
      return !emailsToExclude.includes(attempt.email);
    });
    // --- END BLOCK TO UNCOMMENT ---
    */
    
    console.log("Filtered attempts (currently showing all highest scores):", filteredAttempts);

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
      
      let scoreClass = 'pass';
      if ((attempt.score || 0) < 80) {
          scoreClass = 'fail';
      }
      
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

