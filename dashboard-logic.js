// IMPORTS
import { 
  db, 
  collection, 
  query, 
  getDocs, 
} from './js/firebase-init.js';

// Function to load dashboard data
async function loadDashboardData() {
  const container = document.getElementById('dashboard-container');
  const loadingEl = document.getElementById('dashboard-loading');
  
  if (!container || !loadingEl) {
    console.error("Dashboard elements not found.");
    return;
  }

  try {
    // 1. Get all documents from the 'users' collection
    const usersCollectionRef = collection(db, 'users');
    const usersQuery = query(usersCollectionRef);
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
        loadingEl.textContent = "No users found in the database.";
        return;
    }

    let usersProcessed = 0;

    // 2. Loop through each user doc in the 'users' collection
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const parentUserEmail = userData?.email || userDoc.id; // Use email or UID as fallback

      // --- Filter out admin/test accounts ---
      // (Leaving this commented out as per your video so you can see all test data)
      // const emailsToExclude = ['dan@myteacherdan.com', 'test@kohsel.com'];
      // if (emailsToExclude.includes(parentUserEmail)) {
      //   continue; // Skip this user
      // }
      // --- End Filter ---

      // 3. Get the 'quizAttempts' sub-collection for this user
      const quizAttemptsRef = collection(db, 'users', userDoc.id, 'quizAttempts');
      const quizAttemptsQuery = query(quizAttemptsRef);
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);

      // 4. If this user has no attempts, skip creating a module for them
      if (quizAttemptsSnapshot.empty) {
        continue; // Skip to the next user
      }

      usersProcessed++; // We found a user with attempts
      let allQuizAttempts = [];

      // 5. Loop through each quiz attempt and add it to an array
      quizAttemptsSnapshot.forEach(quizDoc => {
        const quizData = quizDoc.data();
        allQuizAttempts.push(quizData);
      });

      // 6. Sort all attempts for THIS USER by timestamp, newest first
      allQuizAttempts.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

      // 7. Build the HTML for this user's module
      
      // Create the module container
      const moduleDiv = document.createElement('div');
      moduleDiv.className = 'student-module';

      // Create the user email heading
      const heading = document.createElement('h3');
      heading.textContent = parentUserEmail;
      moduleDiv.appendChild(heading);

      // Create the table for this user
      const table = document.createElement('table');
      table.className = 'dashboard-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Quiz Name</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
      `;
      
      const tableBody = document.createElement('tbody');
      
      // 8. Populate the table with ALL attempts for this user
      allQuizAttempts.forEach(attempt => {
        const row = document.createElement('tr');
        
        let scoreClass = (attempt.score || 0) >= 80 ? 'pass' : 'fail';
        const date = attempt.timestamp ? new Date(attempt.timestamp.seconds * 1000).toLocaleString() : 'N/A';
        const quizName = attempt.quizName || 'N/A'; 
        
        row.innerHTML = `
          <td>${quizName}</td> 
          <td><span class="quiz-score ${scoreClass}">${attempt.score}%</span></td>
          <td>${date}</td>
        `;
        tableBody.appendChild(row);
      });

      table.appendChild(tableBody);
      moduleDiv.appendChild(table);
      
      // 9. Append the entire module to the main container
      container.appendChild(moduleDiv);
    } // End of FOR loop (next user)

    // 10. Update loading message
    if (usersProcessed === 0) {
      loadingEl.textContent = "No quiz attempts found for any students.";
    } else {
      loadingEl.style.display = 'none'; // Hide loading message
    }

  } catch (error) {
    console.error("Error loading dashboard data: ", error);
    loadingEl.textContent = "Error loading data. Check console and Firestore rules.";
    loadingEl.style.color = 'red';
  }
}

// Call the function directly.
// protect.js has already confirmed this user is an admin.
loadDashboardData();
