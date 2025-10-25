// Imports from our local firebase-init.js
import { 
  auth, 
  db, 
  doc, 
  setDoc, 
  serverTimestamp 
} from './firebase-init.js';

// Helper function to save quiz data
async function saveQuizToFirestore(user, quizId, quizName, score, answers) {
    if (!user) return; // Exit if no user

    try {
        // Create a unique ID for this quiz attempt
        const quizAttemptId = `${quizId}_${Date.now()}`;
        
        // Create a reference to the document
        // Path: /users/{userId}/quizAttempts/{quizAttemptId}
        const docRef = doc(db, 'users', user.uid, 'quizAttempts', quizAttemptId);

        // Set the data
        await setDoc(docRef, {
            quizId: quizId,
            quizName: quizName,
            score: score,
            answers: answers, // Store the answers given
            timestamp: serverTimestamp(),
            userEmail: user.email // Store email for easier lookup
        });

        console.log(`Quiz score for ${quizId} saved successfully!`);
        
    } catch (error) {
        console.error(`Error saving quiz score for ${quizId}: `, error);
        throw error; // Re-throw error to be caught by the form listener
    }
}


// Ensure this script runs only when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Handler for Test Quiz ---
    const testQuizForm = document.getElementById('test-quiz-form');
    const testQuizResult = document.getElementById('test-quiz-result');

    if (testQuizForm && testQuizResult) {
        testQuizForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = auth.currentUser;
            if (!user) {
                testQuizResult.textContent = "Error: You must be logged in to submit a quiz.";
                testQuizResult.className = 'quiz-result error';
                testQuizResult.style.display = 'block';
                return;
            }

            const formData = new FormData(testQuizForm);
            const q1 = formData.get('q1');
            const q2 = formData.get('q2');
            
            let score = 0;
            if (q1 === 'paris') score += 50;
            if (q2 === '4') score += 50;

            const answers = { q1, q2 };
            
            try {
                await saveQuizToFirestore(user, 'test_email_mistakes', 'Test Quiz: Common Email Mistakes', score, answers);
                testQuizResult.textContent = `Your test score: ${score}%`;
                testQuizResult.className = 'quiz-result success';
            } catch (error) {
                testQuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                testQuizResult.className = 'quiz-result error';
            }
            testQuizResult.style.display = 'block';
        });
    }

    // --- NEW: Handler for Powtoon Quiz ---
    const powtoonQuizForm = document.getElementById('powtoon-quiz-form');
    const powtoonQuizResult = document.getElementById('powtoon-quiz-result');

    if (powtoonQuizForm && powtoonQuizResult) {
        powtoonQuizForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = auth.currentUser;
            if (!user) {
                powtoonQuizResult.textContent = "Error: You must be logged in to submit a quiz.";
                powtoonQuizResult.className = 'quiz-result error';
                powtoonQuizResult.style.display = 'block';
                return;
            }

            const formData = new FormData(powtoonQuizForm);
            const pq1 = formData.get('pq1');
            const pq2 = formData.get('pq2');
            
            // --- ACTION REQUIRED ---
            // Update this logic with your real correct answers
            let score = 0;
            if (pq1 === 'b') score += 50; 
            // Simple text check, case-insensitive and trimmed
            if (pq2 && pq2.trim().toLowerCase() === 'smith') score += 50; 
            // --- END ACTION ---

            const answers = { pq1, pq2 };

            try {
                await saveQuizToFirestore(user, 'powtoon_450k_decision', 'Quiz: The 450000 Decision', score, answers);
                powtoonQuizResult.textContent = `Your quiz score: ${score}%`;
                powtoonQuizResult.className = 'quiz-result success';
            } catch (error) {
                powtoonQuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                powtoonQuizResult.className = 'quiz-result error';
            }
            powtoonQuizResult.style.display = 'block';
        });
    }
});
