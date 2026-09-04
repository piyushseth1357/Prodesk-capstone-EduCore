# AI Prompts Used — EduCore

I used AI mainly to troubleshoot errors, architect secure authentication pipelines, and build feature modules for Sprints 13, 14, 15, and 16. Here's roughly what I asked:

## Sprint 13 — Planning & Architecture
1. "What collections should an LMS database have?"
   → Got a starting point, then adjusted it myself to fit EduCore's specific features (Users, Courses, Lessons, Enrollments).

2. "How do I make a progress bar look right in Figma without a plugin?"
   → I was stuck on this in the wireframe, AI explained the overlapping rectangles trick.

3. "How to write dbdiagram.io syntax for table relationships"
   → Used AI to quickly reference syntax for foreign keys and relationships between Users, Courses, and Enrollments.

## Sprint 14 — Auth Architecture & Security
4. "Why does MongoDB Mongoose throw querySrv ECONNREFUSED _mongodb._tcp error on Windows?"
   → AI diagnosed Windows DNS lookup failure with ISP DNS servers and provided the Node `dns.setServers(['8.8.8.8', '1.1.1.1'])` solution.

5. "How to implement bcryptjs password hashing pre-save hook in Mongoose without plain-text storage?"
   → AI assisted with setting up salt factor 10 and `userSchema.pre('save')` hook along with `matchPassword` method.

6. "How to handle JWT token validation middleware in Express and client redirection in React Router?"
   → AI explained `Authorization: Bearer <token>` extraction, JWT verify signature, and `ProtectedRoute` wrapper component.

## Sprint 15 — Secure REST API CRUD & Monetization
7. "How to enforce Data Ownership validation in Express controllers returning 403 Forbidden?"
   → AI guided comparing `course.instructor.toString()` against `req.user._id.toString()` before permitting PUT or DELETE operations.

8. "How to implement Optimistic UI deletion in React state without page reloads?"
   → AI demonstrated mutating local state array with `.filter()` instantly before async fetch completes, with state rollback on error.

9. "How to create a Stripe Checkout Session endpoint in Node.js and redirect on the frontend?"
   → AI showed setting up `stripe.checkout.sessions.create` with `line_items` and handling the payment success redirect flow.

## Sprint 16 — AI Microservice & Backend Hardening
10. "How to build a Zod validation middleware for Express returning 400 Bad Request on malformed JSON?"
    → AI assisted with `validateRequest` middleware wrapper using `schema.parseAsync(req.body)` and returning structured `400 Bad Request` JSON error details.

11. "How to catch Mongoose CastError globally in Express error handling middleware?"
    → AI explained checking `if (err.name === 'CastError')` in global error handler middleware to prevent fatal server crashes and return clean `400 Bad Request`.

12. "How to architect a server-side Google Gemini AI endpoint in Express using @google/generative-ai SDK?"
    → AI guided building `POST /api/ai/suggest` using server-side `GEMINI_API_KEY`, forcing strict JSON LLM responses, and implementing `express-rate-limit` throttling (`429 Too Many Requests`).
