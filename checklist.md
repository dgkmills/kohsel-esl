Kohsel ESL - Master Project ChecklistThis document tracks all project files, tasks, and future goals for the Kohsel English website.Project File ManifestThis tree shows the project structure and maps each key file to its function and its corresponding name in the Canvas editor.kohsel-english/
|
|-- public/
|   |-- css/
|   |   |-- styles.css
|   |       |-- Function: Main stylesheet for the entire site.
|   |       |-- Canvas File: Updated Styles
|   |
|   |-- js/
|   |   |-- app.js
|   |   |   |-- Function: PWA service worker registration.
|   |   |   |-- Canvas File: No changes needed.
|   |   |-- firebase-init.js
|   |   |   |-- Function: Holds Firebase config & exports SDKs.
|   |   |   |-- Canvas File: No changes needed.
|   |   |-- login-logic.js
|   |   |   |-- Function: Firebase login/auth code.
|   |   |   |-- Canvas File: Login Logic
|   |   |-- protect.js
|   |   |   |-- Function: Firebase auth check & admin routing.
|   |   |   |-- Canvas File: No changes needed.
|   |   |-- quiz-logic.js
|   |   |   |-- Function: Saves main quiz scores (from videos.html) to Firestore.
|   |   |   |-- Canvas File: No changes needed.
|   |   |-- lesson-quiz-logic.js
|   |   |   |-- Function: Saves lesson-specific quiz scores to Firestore.
|   |   |   |-- Canvas File: No changes needed.
|   |   |-- dashboard-logic.js
|   |   |   |-- Function: Fetches scores from Firestore for the admin dashboard.
|   |   |   |-- Canvas File: No changes needed.
|   |
|   |-- images/
|   |   |-- logo.png
|   |   |-- icon-192.png
|   |   |-- icon-512.png
|   |
|   |-- lessons/
|   |   |-- (All 19 PDF lesson files)
|   |
|   |-- index.html
|   |   |-- Function: Homepage
|   |   |-- Canvas File: Home Page
|   |-- lessons.html
|   |   |-- Function: Page for linking to lesson PDFs.
|   |   |-- Canvas File: Lessons Page
|   |-- videos.html
|   |   |-- Function: Video placeholders & Test Quiz.
|   |   |-- Canvas File: Videos Page
|   |-- tools.html
|   |   |-- Function: Page for embedding external tools.
|   |   |-- Canvas File: Tools Page
|   |-- login.html
|   |   |-- Function: Login page.
|   |   |-- Canvas File: Login Page
|   |-- dashboard.html
|   |   |-- Function: Admin dashboard for viewing scores.
|   |   |-- Canvas File: Dashboard Page
|   |-- lesson-20.html
|   |   |-- Function: Interactive slideshow for Lesson 20.
|   |   |-- Canvas File: Lesson 20 (Interactive)
|   |-- lessons-02.html
|   |   |-- Function: Interactive slideshow for Lesson 02 (with audio).
|   |   |-- Canvas File: Lesson 02 (Interactive)
|   |-- manifest.json
|   |   |-- Function: PWA configuration file.
|   |   |-- Canvas File: PWA Manifest
|   |-- sw.js
|   |   |-- Function: PWA service worker file for offline caching.
|   |   |-- Canvas File: No changes needed.
|
|-- project-checklist.md  (This file)
|-- CNAME
|-- .firebaserc
|-- firebase.json
|-- config/firestore.rules
|-- storage.rules
Project Tasks & Phases
Phase 1: Initial Setup 
(Completed)This phase established the core project structure, created all static pages (Home, Lessons, Tools, Videos, Login), set up the initial PWA files (manifest, service worker), embedded the external tools, added lesson PDFs, and deployed the first version.

Phase 2: Feature Expansion (In Progress)
Completed Tasks
[X] Backend: Set up Firebase project (Auth & Firestore).
[X] Backend: Implemented Firebase Authentication (login-logic.js, protect.js).
[X] Feature: Built test quiz system on videos.html.
[X] Backend: Created quiz-logic.js and lesson-quiz-logic.js to save scores to Firestore.
[X] Feature: Built "Management Dashboard" (dashboard.html, dashboard-logic.js).

Next Steps (To-Do)
[ ] Backend: Build Student Dashboard for users to see their personal quiz and game scores.
[ ] Feature: Add "elevator pitch" to user database to allow for dashboard personalization.
[ ] Feature: Design and build "Company Glossary" page.[ ] Feature: Design and build "Q&A Forum" page.
[ ] Feature: Create "Feedback Form" (can use Netlify Forms for simplicity).
[ ] Feature: Add interactive feedback to video transcripts (click a word to load video at that timestamp).
[ ] Content: Create and upload new lesson materials.
[ ] Content: Film and upload video lessons to replace placeholders.
[ ] PWA: Create 192x192 and 512x512 icons from logo.png.Phase 3: Refinements & Future Goals (To-Do)(Based on feedback and suggestions)
[ ] UI/UX: Refine CSS for a more modern, polished look (Consider integrating Tailwind CSS).
[ ] UI/UX: Add clearer user feedback for actions (e.g., "Saving..." indicators on quiz submission, more descriptive error messages if Firestore fails).
[ ] UI/UX: Add relevant icons or simple graphics to text-heavy lesson slides (lesson-20.html) to improve visual engagement.
[ ] Dashboard: Enhance admin dashboard with filtering or sorting options (e.g., by user, by quiz, by date range).
[ ] Feature: Embed simple comprehension checks (e.g., multiple choice) within the lesson slideshows themselves for instant feedback.
[ ] PWA: Improve offline capabilities (e.g., cache lesson files, key video/audio).
[ ] Content: Add more audio/video resources.[ ] Code: Add comments to more complex JavaScript sections (especially Firestore interactions in quiz-logic.js and dashboard-logic.js) for future maintainability.