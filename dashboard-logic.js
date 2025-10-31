// IMPORTS
import { 
  db, 
  collection, 
  query, 
  getDocs, 
} from './js/firebase-init.js';

// --- Helper Function to format date ---
function formatDate(timestamp) {
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return 'N/A';
}

// --- Helper Function to build the history table ---
function buildHistoryTable(attempts) {
  // Create a simple table for the history
  const table = document.createElement('table');
  table.className = 'history-table';
  
  let tableHTML = '<tbody>';
  attempts.forEach(attempt => {
    const date = formatDate(attempt.timestamp);
    const scoreClass = (attempt.score || 0) >= 80 ? 'pass' : 'fail';
    tableHTML += `
      <tr>
        <td><span class="quiz-score ${scoreClass}">${attempt.score}%</span></td>
        <td>${date}</td>
      </tr>
    `;
  });
  tableHTML += '</tbody>';
  
  table.innerHTML = tableHTML;
  return table;
}

// --- Main Function to load dashboard data ---
async function loadDashboardData() {
  const container = document.getElementById('dashboard-container');
  const loadingEl = document.getElementById('dashboard-loading');
  
  if (!container || !loadingEl) {
    console.error("Dashboard elements not found.");
    return;
  }

  try {
    // 1. Get all users
    const usersCollectionRef = collection(db, 'users');
    const usersQuery = query(usersCollectionRef);
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
        loadingEl.textContent = "No users found in the database.";
        return;
    }

    let usersProcessed = 0;

    // 2. Loop through each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const parentUserEmail = userData?.email || userDoc.id;

      // 3. Get all quiz attempts for this user
      const quizAttemptsRef = collection(db, 'users', userDoc.id, 'quizAttempts');
      const quizAttemptsQuery = query(quizAttemptsRef);
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);

      if (quizAttemptsSnapshot.empty) {
        continue; // Skip user if they have no attempts
      }

      usersProcessed++;

      // --- NEW LOGIC: Group attempts by quizId ---
      const quizzesMap = new Map();
      
      quizAttemptsSnapshot.forEach(quizDoc => {
        const attempt = quizDoc.data();
        const quizId = attempt.quizId || 'unknown_quiz';
        
        if (!quizzesMap.has(quizId)) {
          quizzesMap.set(quizId, []); // Create an array for this quiz
        }
        quizzesMap.get(quizId).push(attempt);
      });
      // --- END NEW LOGIC ---

      // 4. Create the outer module for the student
      const studentModuleDiv = document.createElement('div');
      studentModuleDiv.className = 'student-module';
      const heading = document.createElement('h3');
      heading.textContent = parentUserEmail;
      studentModuleDiv.appendChild(heading);

      // 5. Process each unique quiz for this student
      for (const [quizId, attempts] of quizzesMap.entries()) {
        
        // Sort attempts: highest score first, then newest first
        attempts.sort((a, b) => {
          if ((b.score || 0) !== (a.score || 0)) {
            return (b.score || 0) - (a.score || 0); // Highest score first
          }
          return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0); // Newest first
        });

        const topAttempt = attempts[0];
        const quizName = topAttempt.quizName || 'Unnamed Quiz';
        const topScore = topAttempt.score || 0;
        const topDate = formatDate(topAttempt.timestamp);
        const scoreClass = topScore >= 80 ? 'pass' : 'fail';
        
        // Create the module for this specific quiz
        const quizSummaryModule = document.createElement('div');
        quizSummaryModule.className = 'quiz-summary-module';

        // --- Create the Header Row ---
        const headerDiv = document.createElement('div');
        headerDiv.className = 'quiz-summary-header';
        
        headerDiv.innerHTML = `
          <span class="quiz-name">${quizName}</span>
          <span class="quiz-score ${scoreClass}">${topScore}%</span>
          <span class="quiz-date">${topDate}</span>
        `;
        
        // Create the history button
        const historyBtn = document.createElement('button');
        historyBtn.className = 'history-toggle-btn';
        historyBtn.textContent = `Show History (${attempts.length})`;
        
        headerDiv.appendChild(historyBtn);
        quizSummaryModule.appendChild(headerDiv);

        // --- Create the Collapsible History Table ---
        const historyContainer = document.createElement('div');
        historyContainer.className = 'quiz-history-container';
        historyContainer.style.display = 'none'; // Hide by default
        
        const historyTable = buildHistoryTable(attempts); // Use helper
        historyContainer.appendChild(historyTable);
        quizSummaryModule.appendChild(historyContainer);
        
        // --- Add click listener for the toggle button ---
        historyBtn.addEventListener('click', () => {
            const isHidden = historyContainer.style.display === 'none';
            historyContainer.style.display = isHidden ? 'block' : 'none';
            historyBtn.textContent = isHidden ? `Hide History (${attempts.length})` : `Show History (${attempts.length})`;
        });

        // Add this quiz module to the student's main module
        studentModuleDiv.appendChild(quizSummaryModule);
      } // End of quiz loop

      // 6. Append the entire student module to the main container
      container.appendChild(studentModuleDiv);

    } // End of user loop

    // 7. Update loading message
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

// Call the function
loadDashboardData();

