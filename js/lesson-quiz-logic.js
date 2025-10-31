// Imports from our local firebase-init.js
import { 
  auth, 
  db, 
  doc, 
  setDoc, 
  serverTimestamp 
} from './firebase-init.js';

// Helper function to save quiz data
async function saveQuizToFirestore(user, quizId, quizName, score, answers, collectionName) {
    if (!user) return; // Exit if no user

    try {
        const quizAttemptId = `${quizId}_${Date.now()}`;
        const docRef = doc(db, 'users', user.uid, collectionName, quizAttemptId);

        await setDoc(docRef, {
            quizId: quizId,
            quizName: quizName,
            score: score,
            answers: answers, 
            timestamp: serverTimestamp(),
            userEmail: user.email // Store email
        });
        console.log(`Quiz score for ${quizId} saved successfully to ${collectionName}!`);
        
    } catch (error) {
        console.error(`Error saving quiz score for ${quizId} to ${collectionName}: `, error);
        throw error; 
    }
}


// Ensure this script runs only when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // This file is only for lesson-specific pages, so we only check for those.
    // The forms on videos.html are handled by quiz-logic.js

    // --- Handler for Lesson 22 Expressing Opinions Quiz (in lesson-22-video-quiz.html) ---
    const lesson22QuizForm = document.getElementById('lesson-quiz-form');
    const lesson22QuizResult = document.getElementById('quiz-result-message'); // Using the common result ID

    // Check if the form is for lesson 22 before adding the listener
    if (lesson22QuizForm && lesson22QuizResult && lesson22QuizForm.dataset.lessonId === 'lesson22') {
        lesson22QuizForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // --- FIX: Disable button to prevent duplicates ---
            const submitButton = lesson22QuizForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            const user = auth.currentUser;
            if (!user) {
                lesson22QuizResult.textContent = "Error: You must be logged in to submit this quiz.";
                lesson22QuizResult.className = 'quiz-result error';
                lesson22QuizResult.style.display = 'block';
                if (submitButton) submitButton.disabled = false; // Re-enable on error
                return;
            }

            const formData = new FormData(lesson22QuizForm);
            const q1 = formData.get('q1');
            const q2 = formData.get('q2');
            const q3 = formData.get('q3');
            const q4 = formData.get('q4');
            const q5 = formData.get('q5');
            
            let score = 0;
            if (q1 === 'b') score += 20;
            if (q2 === 'b') score += 20;
            if (q3 === 'a') score += 20;
            if (q4 === 'c') score += 20;
            if (q5 === 'a') score += 20;
            
            const answers = { q1, q2, q3, q4, q5 };

            try {
                // Saving to 'quizAttempts' for consistency
                await saveQuizToFirestore(user, 'lesson_22_opinions', 'Quiz: Expressing Opinions', score, answers, 'quizAttempts');
                
                lesson22QuizResult.textContent = `Your quiz score: ${score}%`;
                lesson22QuizResult.className = 'quiz-result success';
            } catch (error) {
                lesson22QuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                lesson22QuizResult.className = 'quiz-result error';
                if (submitButton) submitButton.disabled = false; // Re-enable on error
            }
            lesson22QuizResult.style.display = 'block';
        });
    }

});
