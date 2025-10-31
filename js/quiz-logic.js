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
        // Use a unique ID for each attempt
        const quizAttemptId = `${quizId}_${Date.now()}`;
        const docRef = doc(db, 'users', user.uid, collectionName, quizAttemptId);

        await setDoc(docRef, {
            quizId: quizId,
            quizName: quizName,
            score: score,
            answers: answers, 
            timestamp: serverTimestamp(),
            userEmail: user.email // Store the user's email WITH the quiz attempt
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
            
            // --- FIX: Disable button to prevent duplicates ---
            const submitButton = powtoonQuizForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            const user = auth.currentUser;
            if (!user) {
                powtoonQuizResult.textContent = "Error: You must be logged in to submit a quiz.";
                powtoonQuizResult.className = 'quiz-result error';
                powtoonQuizResult.style.display = 'block';
                if (submitButton) submitButton.disabled = false; // Re-enable on error
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
                if (submitButton) submitButton.disabled = false; // Re-enable on error
            }
            powtoonQuizResult.style.display = 'block';
        });
    }

    // --- Handler for Lesson 20 Communication Challenge Quiz (in videos.html) ---
    const lesson20QuizForm = document.getElementById('lesson20-quiz-form');
    const lesson20QuizResult = document.getElementById('lesson20-quiz-result');

    if (lesson20QuizForm && lesson20QuizResult) {
        lesson20QuizForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // --- FIX: Disable button to prevent duplicates ---
            const submitButton = lesson20QuizForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            const user = auth.currentUser;
            if (!user) {
                lesson20QuizResult.textContent = "Error: You must be logged in to submit this quiz.";
                lesson20QuizResult.className = 'quiz-result error';
                lesson20QuizResult.style.display = 'block';
                if (submitButton) submitButton.disabled = false; // Re-enable on error
                return;
            }

            const formData = new FormData(lesson20QuizForm);
            const l20q1 = formData.get('l20q1');
            const l20q2 = formData.get('l20q2');
            const l20q3 = formData.get('l20q3');
            const l20q4 = formData.get('l20q4');
            const l20q5 = formData.get('l20q5'); // Textarea
            
            let score = 0;
            if (l20q1 === 'b') score += 20; 
            if (l20q2 === 'c') score += 20; 
            if (l20q3 === 'b') score += 20; 
            if (l20q4 === 'a') score += 20; 
            if (l20q5 && l20q5.trim().length >= 10) score += 20; 

            const answers = { l20q1, l20q2, l20q3, l20q4, l20q5 };

            try {
                await saveQuizToFirestore(user, 'lesson_20_comm_challenge', 'Quiz: Clear Communication Challenge', score, answers, 'quizAttempts');
                
                lesson20QuizResult.textContent = `Your quiz score: ${score}%`;
                lesson20QuizResult.className = 'quiz-result success';
            } catch (error) {
                lesson20QuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                lesson20QuizResult.className = 'quiz-result error';
                if (submitButton) submitButton.disabled = false; // Re-enable on error
            }
            lesson20QuizResult.style.display = 'block';
        });
    }

    // --- Handler for Lesson 21 Small Talk Quiz (in videos.html) ---
    const lesson21QuizForm = document.getElementById('lesson21-quiz-form');
    const lesson21QuizResult = document.getElementById('lesson21-quiz-result');

    if (lesson21QuizForm && lesson21QuizResult) {
        lesson21QuizForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // --- FIX: Disable button to prevent duplicates ---
            const submitButton = lesson21QuizForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            const user = auth.currentUser;
            if (!user) {
                lesson21QuizResult.textContent = "Error: You must be logged in to submit this quiz.";
                lesson21QuizResult.className = 'quiz-result error';
                lesson21QuizResult.style.display = 'block';
                if (submitButton) submitButton.disabled = false; // Re-enable on error
                return;
            }

            const formData = new FormData(lesson21QuizForm);
            const l21q1 = formData.get('l21q1');
            const l21q2 = formData.get('l21q2');
            const l21q3 = formData.get('l21q3');
            const l21q4 = formData.get('l21q4');
            const l21q5 = formData.get('l21q5'); // Textarea
            
            let score = 0;
            if (l21q1 === 'b') score += 20;
            if (l21q2 === 'a') score += 20;
            if (l21q3 === 'b') score += 20;
            if (l21q4 === 'b') score += 20;
            if (l21q5 && l21q5.trim().length >= 5) score += 20;

            const answers = { l21q1, l21q2, l21q3, l21q4, l21q5 };

            try {
                await saveQuizToFirestore(user, 'lesson_21_small_talk', 'Quiz: Small Talk Scenario Practice', score, answers, 'quizAttempts');
                
                lesson21QuizResult.textContent = `Your quiz score: ${score}%`;
                lesson21QuizResult.className = 'quiz-result success';
            } catch (error) {
                lesson21QuizResult.textContent = `Score: ${score}%. (Error saving to database.)`;
                lesson21QuizResult.className = 'quiz-result error';
                if (submitButton) submitButton.disabled = false; // Re-enable on error
            }
            lesson21QuizResult.style.display = 'block';
        });
    }

    // --- Handler for Lesson 22 Expressing Opinions Quiz (in videos.html) ---
    const lesson22QuizForm = document.getElementById('lesson22-quiz-form');
    const lesson22QuizResult = document.getElementById('lesson22-quiz-result'); 

    if (lesson22QuizForm && lesson22QuizResult) {
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
            const l22q1 = formData.get('l22q1');
            const l22q2 = formData.get('l22q2');
            const l22q3 = formData.get('l22q3');
            const l22q4 = formData.get('l22q4');
            const l22q5 = formData.get('l22q5');
            
            let score = 0;
            if (l22q1 === 'b') score += 20;
            if (l22q2 === 'b') score += 20;
            if (l22q3 === 'a') score += 20;
            if (l22q4 === 'c') score += 20;
            if (l22q5 === 'a') score += 20;
            
            const answers = { l22q1, l22q2, l22q3, l22q4, l22q5 };

            try {
                await saveQuizToFirestore(user, 'lesson_22_opinions_videos_page', 'Quiz: Expressing Opinions', score, answers, 'quizAttempts');
                
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
