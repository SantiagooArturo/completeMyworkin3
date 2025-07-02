// GitHub Copilot prompt:
//
// You are helping me build a new “Interview Simulation” section in a Next.js application.
// This feature uses OpenAI’s GPT-4 API to generate an interview flow and Whisper to transcribe user audio/video answers.
// It also uses Firebase as a database, and Cloudflare R2 for storing media files through /api/upload endpoint.
// The simulation should:
//
// 1. Show an input field where the user types the job title they want to apply for (e.g. “Practicante de ventas en Coca Cola” or “Analista de marketing en banca”).
// 2. When the user submits the job title, call OpenAI’s chat completion to generate exactly 4 interview-style questions tailored to that role.
// 3. Present each question one at a time:
//    • Display the question text.
//    • Offer buttons to record audio or video directly in the browser.
//    • After recording, upload the media to our Cloudflare R2 storage via POST to /api/upload, which returns a URL.
//    • Send the URL to Whisper to transcribe the answer.
//    • Send both the transcription and the original question to OpenAI for evaluation.
//    • Receive a JSON response with:
//        “score”: integer from 1 to 10,
//        “summary”: string,
//        “strengths”: array of strings,
//        “improvements”: array of strings,
//        “recommendations”: array of strings.
//    • Render that feedback below the question in a styled card.
//
// 4. After all 4 questions are answered, save the entire interview session to Firebase under the user’s document, including:
//    • jobTitle
//    • timestamp
//    • array of { question, mediaUrl, transcript, score, summary, strengths, improvements, recommendations }
//    • total credits consumed (1 question = 1 credit).
// 5. Decrement the user’s credit balance in Firebase by the number of questions asked.
// 6. Provide a link to “Interview History” where the user can see past sessions, scores, and feedback.
//
// Architecture/Tech details:
// - Use Next.js App Router (app/interview-simulation/page.tsx).
// - Use React hooks for state & effects.
// - Use the browser MediaRecorder API for audio/video capture.
// - Use fetch() for all network requests (OpenAI, Whisper, upload, Firebase REST API).
// - Manage Firebase authentication to identify the user.
// - Use Tailwind CSS for styling and layout.
//
// Generate a complete Next.js React component (or set of components) implementing this flow, including API route stubs under /pages/api for OpenAI/Whisper calls and credit management.
