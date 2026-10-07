# SKILL-TO-JOB INTELLIGENCE PLATFORM

## MASTER SPECIFICATION — BUILD LOCALLY FROM SCRATCH

### 1. PRODUCT OBJECTIVE

Build a complete MERN + AI web application that answers: **“Given my resume, skills, and a target job, how ready am I, what skills am I missing, which gaps matter most, and exactly what should I do to become job-ready?”**

Core flow:
**Register → Profile → Upload Resume → Extract/Normalize Skills → Add/Paste Job → Extract Requirements → Analyze → Match Skills → Calculate Readiness → Identify/Prioritize Gaps → Generate Roadmap → Take Skill Assessment → Verify Skills → Recalculate Readiness → What-If Simulation → Track Applications → View Progress.**

This must be a real full-stack application using MongoDB persistence and real backend APIs, NOT a collection of mock UI pages.

---

### 2. DEVELOPMENT RULES

1. Build strictly phase-by-phase; do not generate the entire application at once.
2. Before every phase, inspect the existing repository and preserve the established architecture.
3. Complete each feature end-to-end: **Model → Validation → Service → Controller → Route → API integration → State → UI → Loading/Error/Empty states → Persistence → Testing.**
4. Do not use hardcoded readiness scores, skill matches, gaps, or fake statistics.
5. Do not use mock data after the corresponding backend functionality exists.
6. Keep controllers thin and business logic inside services.
7. AI must NOT control deterministic business logic. AI handles extraction, interpretation, explanations, roadmap generation and question generation. Backend services handle matching, scoring, priority, assessment scoring and simulations.
8. Keep AI provider replaceable through an abstraction (`AIProvider → GeminiProvider / GroqProvider`).
9. Never expose AI API keys to React.
10. Every user-owned resource must be protected by authorization.
11. Validate both frontend and backend inputs.
12. Do not implement deployment, AWS, CI/CD, Kubernetes, production monitoring, mobile app, browser extension, automated scraping, LinkedIn automation, payments or social networking in this version.

---

### 3. TECHNOLOGY STACK

**Frontend:** React + Vite, TypeScript preferred, React Router, Redux Toolkit, RTK Query/Axios, Tailwind CSS, Recharts, React Hook Form, Zod, Lucide React.

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer, PDF parser, Zod/Joi.

**AI:** Gemini initially; architecture must support Groq later.

**Suggested structure:**
`client/src/{components,layouts,pages,features,hooks,services,store,utils,constants,types}`
`server/src/{config,controllers,middleware,models,routes,services,utils,validators,prompts}`
`services/{ai,resume,skills,matching,roadmap,assessment}`

---

# 4. PHASES

## PHASE 0 — FOUNDATION

Create React/Vite frontend, Express backend, MongoDB connection, environment configuration, CORS, JSON middleware, global error handling and `/api/health`. Create `.env.example`; never commit `.env`. Verify frontend ↔ backend ↔ MongoDB communication.

## PHASE 1 — AUTHENTICATION

Create `User`: name, email, passwordHash, profile, createdAt, updatedAt. Use bcrypt + JWT. APIs: register, login, logout, `/me`. Create login/register pages and protected routes. Handle duplicate email, invalid credentials and expired/invalid authentication.

## PHASE 2 — USER PROFILE

Create editable profile: name, headline, education, experience level, years of experience, target role, preferred roles, location and manual skills. Store skill source as `resume`, `manual`, or `assessment`.

## PHASE 3 — RESUME INTELLIGENCE

Support PDF upload through Multer. Validate MIME type, extension and size. Extract text using a PDF parser. Create `Resume`: userId, fileName, extractedText, summary, skills[], education[], experience[], projects[], certifications[], parsedAt, createdAt. Use AI to convert resume text into structured data, validate AI output, persist it, display it and allow user correction.

Flow:
**PDF → Validation → Text Extraction → AI Parsing → Structured Resume → Skill Extraction → Review/Edit → Save.**

## PHASE 4 — SKILL INTELLIGENCE ENGINE

Create centralized skill service and `Skill` model: name, category, aliases, parentSkill, relatedSkills, description. Categories: Frontend, Backend, Database, Programming Language, DevOps, Cloud, AI/ML, Data, Security, Testing, CS Fundamentals, Tools, Soft Skills. Normalize aliases such as `JS/Javascript/ECMAScript → JavaScript` and `Node/NodeJS/Node.js → Node.js`. Do not duplicate skill logic across controllers.

## PHASE 5 — JOB INTELLIGENCE

Allow user to create a job manually or paste a real job description. `Job`: userId, title, company, description, location, employmentType, source, extractedSkills[], requiredSkills[], preferredSkills[], experienceRequirements, educationRequirements, responsibilities[], createdAt. Use AI to extract structured requirements. Validate AI JSON before saving. Required and preferred skills must be separate.

## PHASE 6 — SKILL MATCHING ENGINE

Compare the user's normalized skill profile with the target job. For every relevant skill calculate: `userLevel`, `requiredLevel`, `evidence`, `status`. Statuses: `STRONG`, `MATCH`, `PARTIAL`, `WEAK`, `MISSING`. Evidence sources: resume, projects, manual, assessment. Return strengths, weaknesses, matched skills, partial skills and missing skills. Matching must be reproducible and explainable.

## PHASE 7 — READINESS SCORING

Create deterministic scoring service. Calculate overall readiness from configurable components such as technical skill match, skill importance, experience match, project evidence and verified skill evidence. Return:
`overallScore`, `technicalScore`, `experienceScore`, `projectScore`, `verificationScore`.
Normalize to 0–100. Store scoring version/weights with every analysis so historical results remain stable.

## PHASE 8 — GAP INTELLIGENCE

For every weak/missing skill calculate `gapSeverity`, `jobImportance`, `dependencyWeight`, `priority`. Use a deterministic formula such as:
`priority = gapSeverity × jobImportance × dependencyWeight`, normalized to 0–100. Return ranked skill gaps. Example: Docker current 1/5, required 4/5, high importance → high priority.

## PHASE 9 — ANALYSIS DASHBOARD

Create `/analysis/:id`.
Display:

* Target job/company
* Overall readiness
* Technical/project/experience/verification scores
* Skill matrix
* Strengths
* Weaknesses
* Missing skills
* Priority gaps
* Evidence
* Explainability

Skill matrix:
`Skill | User Level | Required Level | Status | Evidence | Priority`

Include loading, error, empty and success states.

## PHASE 10 — PERSONALIZED ROADMAP

Generate roadmap from prioritized gaps. `Roadmap`: userId, jobId, analysisId, goals[], startDate, createdAt. Each goal: skillId, priority, estimatedDays, resources[], tasks[], status. AI generates learning sequence/tasks/explanations; application controls progress/completion/status. User can start, update, pause, complete and regenerate roadmap.

## PHASE 11 — SKILL VERIFICATION

Create assessments to test claimed skills. Initial types: MCQ + short answer; architecture should later support coding/scenario questions. `Assessment`: userId, skillId, difficulty, questions[], score, status, startedAt, completedAt. Difficulty: Beginner/Intermediate/Advanced. Score interpretation must be configurable, e.g. 0–39 Beginner, 40–59 Basic, 60–79 Intermediate, 80–100 Advanced. Show **Resume Claimed Level vs Assessment Level vs Verified Confidence**. Assessment score must be calculated by backend logic.

## PHASE 12 — WHAT-IF CAREER SIMULATOR

Allow user to select one or multiple skills and simulate improvement without modifying saved data. Reuse the actual matching/scoring engine.
Example:
`72% current → +Docker = 79% → +AWS = 84%`.
Show current score, simulated score and improvement.

## PHASE 13 — APPLICATION TRACKER

Create `Application`: userId, jobId, resumeId, status, appliedAt, interviewDate, notes, result, createdAt. Statuses: Saved, Applied, Assessment, Interview, Rejected, Offer, Accepted. Allow full CRUD and status updates.

## PHASE 14 — MAIN DASHBOARD

Dashboard must show actual persisted:

* Target role
* Overall readiness
* Top strengths
* Top gaps
* Active roadmap
* Assessment status
* Applications
* Recent analyses
* Progress
* Readiness trend

No placeholder statistics.

## PHASE 15 — AI CAREER ASSISTANT

Build only after core deterministic functionality works. Assistant context must include relevant user profile, resume, target job, skill matrix, gaps, roadmap and assessment results. User can ask questions such as “Why is Docker my highest priority?” AI must answer using actual user context and must not invent unavailable information. Build a backend context-construction service.

## PHASE 16 — ANALYSIS HISTORY

Persist analysis snapshots. Allow users to view and compare previous analyses:
`September 64% → October 78% → +14%`.
Historical results must not silently change when scoring logic changes.

## PHASE 17 — ANALYTICS

Create charts for readiness over time, skill improvement, assessment performance, roadmap completion and application statistics using Recharts. Provide meaningful no-data states.

## PHASE 18 — ERROR HANDLING

Use consistent API responses:
Success:
`{ success: true, data: {} }`
Error:
`{ success: false, error: { code, message } }`
Handle HTTP 400, 401, 403, 404, 409, 422, 429 and 500. Frontend must show useful errors without exposing secrets.

## PHASE 19 — SECURITY

Implement bcrypt, JWT, authorization on every user-owned resource, PDF validation, input sanitization/validation, backend-only AI keys and safe AI output handling. Explicitly test that User A cannot access User B's resumes, jobs, analyses, roadmaps, assessments or applications.

## PHASE 20 — VALIDATION

Frontend: React Hook Form + Zod. Backend: Zod/Joi. Validate auth, profile, files, job descriptions, skill edits, roadmap updates, assessment submissions, applications and all structured AI output.

## PHASE 21 — TESTING

Test authentication, PDF upload/parsing failures, job CRUD, JD parsing, perfect/partial/no skill matches, missing/extra skills, readiness scoring, assessments, roadmap persistence, what-if simulation and cross-user authorization. Test both happy paths and important failure paths.

## PHASE 22 — UI/UX POLISH

After functionality is complete, create a modern, professional, developer-focused, data-rich UI. Avoid excessive gradients, unnecessary animations, giant cards and generic AI-dashboard styling. Every page must have loading, error, empty, success and responsive states.

---

# 5. DATABASE RELATIONSHIP

User
→ Resumes
→ Jobs
→ Analyses
→ Skill Matches
→ Skill Gaps
→ Roadmaps
→ Assessments
→ Applications

Major entities:
`User, Resume, Skill, Job, Analysis, Roadmap, Assessment, Application`

All major entities must have timestamps and appropriate indexes.

---

# 6. API GROUPS

`/api/auth`
`/api/users`
`/api/resumes`
`/api/skills`
`/api/jobs`
`/api/analyses`
`/api/roadmaps`
`/api/assessments`
`/api/applications`
`/api/analytics`
`/api/assistant`

Keep controllers thin and services reusable.

---

# 7. FRONTEND ROUTES

`/login`
`/register`
`/dashboard`
`/profile`
`/resumes`
`/resumes/upload`
`/jobs`
`/jobs/new`
`/jobs/:id`
`/analysis/:id`
`/roadmap/:id`
`/assessments`
`/assessments/:id`
`/applications`
`/analytics`
`/assistant`

---

# 8. COMPLETE USER JOURNEY

**Register → Login → Complete Profile → Upload Resume → Parse Resume → Review Skills → Add/Paste Target Job → Extract Job Requirements → Analyze → Calculate Readiness → View Skill Matrix → Identify Gaps → Prioritize Gaps → Generate Roadmap → Complete Tasks → Take Assessment → Verify Skills → Recalculate Readiness → Run What-If Simulation → Track Application → View Progress.**

---

# 9. CORE DIFFERENTIATORS

The platform must NOT feel like a normal ATS.

Key differentiators:

1. **Skill Graph** — understand relationships between skills rather than keyword matching.
2. **Job Skill Graph** — understand what a particular job actually requires.
3. **Explainable Readiness Score** — show why the user received the score.
4. **Gap Intelligence** — rank missing skills by actual job importance.
5. **Skill Verification** — distinguish claimed skills from demonstrated skills.
6. **Personalized Roadmap** — turn gaps into an actionable plan.
7. **What-If Simulator** — show how learning a skill changes job readiness.
8. **Historical Progress** — measure whether the user is genuinely becoming more job-ready.
9. **Contextual AI Assistant** — answer using the user's real career data.

---

# 10. DEFINITION OF DONE

Do NOT declare the project complete merely because all pages exist.

A fresh user must be able to:

**Register → upload a real PDF → extract real skills → correct skills → paste a real JD → extract real requirements → analyze compatibility → receive deterministic readiness score → see skill gaps → see prioritized gaps → generate roadmap → complete roadmap tasks → take assessment → receive verified skill level → recalculate readiness → simulate future improvements → track application → view progress.**

All of this must use real MongoDB persistence and working backend APIs. No mock data for implemented functionality.

---

# 11. MASTER ANTIGRAVITY INSTRUCTION

**Build this application phase-by-phase. Do not skip phases and do not create placeholder implementations for core functionality. Before starting each phase, inspect the current repository and understand the existing implementation. Do not rewrite working modules unnecessarily. For every feature implement the complete chain: database model → schema/validation → service → controller → route → frontend API integration → state management → UI → loading/error/empty states → persistence → testing. Do not use mock data once the corresponding backend functionality exists. Keep AI functionality isolated behind provider/service interfaces. AI must perform understanding and generation, while deterministic backend services perform matching, scoring, prioritization, verification and simulations. Validate every AI response before using it. Keep API keys on the backend. Maintain clean modular architecture, reusable services, clear naming, proper error handling, authorization, and documentation. After each phase, verify its acceptance criteria and fix all errors before moving to the next phase. Deployment and production infrastructure are explicitly out of scope for this version.**
