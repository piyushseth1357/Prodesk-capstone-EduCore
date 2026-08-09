# EduCore

## About this project

EduCore is my Capstone project for the Sprint 13-17 program at Prodesk IT. 
I picked this out of the three RFP options given to us (EduCore, VitalSync, 
and TaskMatrix) because I wanted something that lets me focus on solid 
fullstack fundamentals — auth, CRUD, relationships between users and 
data — without getting stuck on a very complex domain like healthcare 
records right at the start of a 5-week solo build.

The idea is to build a simplified version of an LMS like Udemy or 
Coursera — a platform where instructors can create courses and upload 
lessons, and students can browse the catalog, enroll, and track how much 
of a course they've completed.

## Why I chose this over the other two options

- VitalSync (the healthcare EHR option) needed Role-Based Access Control 
  and relational data around patients/doctors/appointments that felt 
  riskier to plan out in just one week, given I'm still fairly new to 
  structuring Express + MongoDB projects.
- TaskMatrix (the Jira-style tool) needed real-time features like an 
  activity feed which adds complexity I didn't want to commit 5 weeks to.
- EduCore's data model (Users, Courses, Lessons, Enrollments) is 
  straightforward enough that I can actually finish it end-to-end instead 
  of getting stuck halfway, but still complex enough to count as a real 
  enterprise-level app per the assignment's requirements.

## My Track

Fullstack

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT-based login/signup
- **Deployment (planned for later sprints):** Vercel for frontend, 
  Render for backend

I'm going with React + Express instead of Next.js because that's what I 
already worked with in Sprint 09's backend track, and I'd rather build 
on what I know than learn a new framework mid-capstone.

## Core Features

### Must build first (MVP — Sprint 14)
1. Authentication — separate signup/login flows for Student and 
   Instructor roles
2. Course Catalog page — students can browse and search all published 
   courses
3. Course Details page — shows syllabus, list of lessons, and an 
   Enroll button
4. Instructor Portal — instructors can create a course and add lessons 
   to it
5. Student Dashboard — shows a list of the courses a student is 
   enrolled in
6. Enrollment logic — connects a student to a course when they enroll

### Building after MVP (Sprint 15)
7. Progress tracking — mark individual lessons as complete, show a 
   progress percentage on the dashboard
8. Video lesson playback UI
9. Filtering courses by category/level

### Later, if time allows (Sprint 16)
10. Ratings and reviews on courses
11. Completion certificates
12. AI-based "recommended courses for you" section

## Database Collections

- **Users** — name, email, password (hashed), role (student/instructor)
- **Courses** — title, description, category, level, instructorId, 
  thumbnail
- **Lessons** — courseId, title, videoUrl, order, duration
- **Enrollments** — studentId, courseId, progress (%), enrolledAt

The relationships: one instructor can create many courses, one course 
has many lessons, and Enrollments is the join between students and 
courses (many-to-many).

## Figma

[link to be added once wireframes are done]

## Architecture Diagram

[ERD image to be embedded once diagram is done]
