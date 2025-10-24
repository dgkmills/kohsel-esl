import { db, collection, query, getDocs } from './firebase-init.js'; // Removed unused imports

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

    // 2. Loop through each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      // Ensure we have an email field saved in the user document when they sign up or first save a score
      const userEmail = userData?.email || userDoc.id; // Use email if available, otherwise UID

      // 3. Get the 'quizAttempts' sub-collection for this user
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
      
      // Use quizName from attempt data
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
    loadingEl.textContent = "Error loading data. See console for details.";
    loadingEl.style.color = 'red';
  }
}

// Ensure the DOM is fully loaded before running the script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboardData);
} else {
    loadDashboardData(); // DOMContentLoaded has already fired
}

