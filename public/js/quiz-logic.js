// UPDATED: All imports now come from our local firebase-init.js
import { 
  auth, 
  db, 
  doc, 
  setDoc, 
  serverTimestamp 
} from './firebase-init.js';

// Ensure this script runs only when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    const quizForm = document.getElementById('test-quiz-form');
    const quizResult = document.getElementById('quiz-result');

    if (quizForm) {
        quizForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. Get the current user
            const user = auth.currentUser;
            if (!user) {
                quizResult.textContent = "Error: You must be logged in to submit a quiz.";
                quizResult.className = 'error';
                return;
            }

            // 2. Get quiz answers
            const formData = new FormData(quizForm);
            const q1 = formData.get('q1');
            const q2 = formData.get('q2');
            
            // 3. Calculate score
            let score = 0;
            if (q1 === 'paris') score += 50;
            if (q2 === '4') score += 50;
            
            // 4. Show result on page
            quizResult.textContent = `Your test score: ${score}%`;
            quizResult.className = 'success';
            quizResult.style.display = 'block';
            
            // 5. Save score to Firestore
            try {
                // Create a unique ID for this quiz attempt
                const quizAttemptId = `quiz_email_mistakes_${Date.now()}`;
                
                // Create a reference to the document
                // Path: /users/{userId}/quizAttempts/{quizAttemptId}
                const docRef = doc(db, 'users', user.uid, 'quizAttempts', quizAttemptId);

                // Set the data
                await setDoc(docRef, {
                    quizId: 'test_email_mistakes',
                    quizName: 'Test Quiz: Common Email Mistakes',
                    score: score,
                    timestamp: serverTimestamp(),
                    userEmail: user.email // Store email for easier lookup
                });

                console.log("Quiz score saved successfully to Firestore!");
                
            } catch (error) {
                console.error("Error saving quiz score: ", error);
                quizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                quizResult.className = 'error';
            }
        });
    }
});

