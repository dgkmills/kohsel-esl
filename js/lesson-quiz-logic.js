// Imports from our local firebase-init.js
import { 
  auth, 
  db, 
  doc, 
  setDoc, 
  serverTimestamp 
} from './firebase-init.js';

// Helper function to save quiz data
// NOTE: This is a copy of the helper from quiz-logic.js
// In a larger app, we might share this, but for now this is simple.
async function saveQuizToFirestore(user, quizId, quizName, score, answers, collectionName) {
    if (!user) return; // Exit if no user

    try {
        const quizAttemptId = `${quizId}_${Date.now()}`;
        
        // Path: /users/{userId}/{collectionName}/{quizAttemptId}
        const docRef = doc(db, 'users', user.uid, collectionName, quizAttemptId);

        // Set the data
        await setDoc(docRef, {
            quizId: quizId,
            quizName: quizName,
            score: score,
            answers: answers,
            timestamp: serverTimestamp(),
            userEmail: user.email
        });

        console.log(`Quiz score for ${quizId} saved successfully!`);
        
    } catch (error) {
        console.error(`Error saving quiz score for ${quizId}: `, error);
        throw error;
    }
}


// Ensure this script runs only when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Handler for Lesson 02 Quiz ---
    const lessonQuizForm = document.getElementById('lesson-quiz-form');
    const lessonQuizResult = document.getElementById('lesson-quiz-result');

    if (lessonQuizForm && lessonQuizResult) {
        lessonQuizForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = auth.currentUser;
            if (!user) {
                lessonQuizResult.textContent = "Error: You must be logged in to submit a quiz.";
                lessonQuizResult.className = 'quiz-result error';
                lessonQuizResult.style.display = 'block';
                return;
            }

            const formData = new FormData(lessonQuizForm);
            const lq1 = formData.get('lq1');
            const lq2 = formData.get('lq2');
            const lq3 = formData.get('lq3');
            const lq4 = formData.get('lq4');
            const lq5 = formData.get('lq5');
            
            let score = 0;
            // 5 questions, 20 points each
            if (lq1 === 'b') score += 20; // Plant
            if (lq2 === 'a') score += 20; // Test
            if (lq3 === 'c') score += 20; // Winding
            if (lq4 === 'a') score += 20; // Copper
            if (lq5 === 'b') score += 20; // send

            const answers = { lq1, lq2, lq3, lq4, lq5 };
            
            try {
                // *** IMPORTANT ***
                // Save to the new 'lessonAttempts' collection, as requested
                await saveQuizToFirestore(user, 'lesson_02_short_vowels', 'Lesson 02: Short Vowel Sounds', score, answers, 'lessonAttempts');
                
                lessonQuizResult.textContent = `Your score: ${score}%`;
                lessonQuizResult.className = 'quiz-result success';
            } catch (error) {
                lessonQuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                lessonQuizResult.className = 'quiz-result error';
            }
            lessonQuizResult.style.display = 'block';
        });
    }

});
