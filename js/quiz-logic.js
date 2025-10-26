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
            userEmail: user.email // Store email - make sure user doc has this field!
        });
        console.log(`Quiz score for ${quizId} saved successfully to ${collectionName}!`);
        
    } catch (error) {
        console.error(`Error saving quiz score for ${quizId} to ${collectionName}: `, error);
        throw error; 
    }
}


// Ensure this script runs only when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Handler for 450k Decision Quiz (in videos.html) ---
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
            const pq3 = formData.get('pq3');
            const pq4 = formData.get('pq4');
            const pq5 = formData.get('pq5'); 
            
            let score = 0;
            if (pq1 === 'b') score += 20; 
            if (pq2 === 'c') score += 20; 
            if (pq3 === 'b') score += 20; 
            if (pq4 === 'b') score += 20; 
            if (pq5 && pq5.trim().length >= 10) score += 20; 

            const answers = { pq1, pq2, pq3, pq4, pq5 };

            try {
                // Video quizzes go to 'quizAttempts'
                await saveQuizToFirestore(user, 'powtoon_450k_decision', 'Quiz: The 450,000 Decision', score, answers, 'quizAttempts');
                powtoonQuizResult.textContent = `Your quiz score: ${score}%`;
                powtoonQuizResult.className = 'quiz-result success';
            } catch (error) {
                powtoonQuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                powtoonQuizResult.className = 'quiz-result error';
            }
            powtoonQuizResult.style.display = 'block';
        });
    }

    // --- NEW: Handler for Lesson 20 Communication Challenge Quiz (in videos.html) ---
    const lesson20QuizForm = document.getElementById('lesson20-quiz-form');
    const lesson20QuizResult = document.getElementById('lesson20-quiz-result');

    if (lesson20QuizForm && lesson20QuizResult) {
        lesson20QuizForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = auth.currentUser;
            if (!user) {
                lesson20QuizResult.textContent = "Error: You must be logged in to submit this quiz.";
                lesson20QuizResult.className = 'quiz-result error';
                lesson20QuizResult.style.display = 'block';
                return;
            }

            const formData = new FormData(lesson20QuizForm);
            const l20q1 = formData.get('l20q1');
            const l20q2 = formData.get('l20q2');
            const l20q3 = formData.get('l20q3');
            const l20q4 = formData.get('l20q4');
            const l20q5 = formData.get('l20q5'); // Textarea
            
            // --- Scoring based on Lesson 19/20 content ---
            let score = 0;
            if (l20q1 === 'b') score += 20; // Correct: Digital sign-off required
            if (l20q2 === 'c') score += 20; // Correct: First / To begin with
            if (l20q3 === 'b') score += 20; // Correct: next
            if (l20q4 === 'a') score += 20; // Correct: It is critical that you...
            // Check if textarea has some content (e.g., at least 10 chars)
            if (l20q5 && l20q5.trim().length >= 10) score += 20; 
            // --- End Scoring ---

            const answers = { l20q1, l20q2, l20q3, l20q4, l20q5 };

            try {
                 // Even though it's on videos.html, this relates to Lesson 20 content.
                 // Let's keep it consistent with other video quizzes and save to 'quizAttempts'
                 // You could create a new collection if you *really* want them separate,
                 // but using the quizName field helps distinguish them.
                await saveQuizToFirestore(user, 'lesson_20_comm_challenge', 'Quiz: Clear Communication Challenge', score, answers, 'quizAttempts');
                
                lesson20QuizResult.textContent = `Your quiz score: ${score}%`;
                lesson20QuizResult.className = 'quiz-result success';
            } catch (error) {
                lesson20QuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                lesson20QuizResult.className = 'quiz-result error';
            }
            lesson20QuizResult.style.display = 'block';
        });
    }

});

