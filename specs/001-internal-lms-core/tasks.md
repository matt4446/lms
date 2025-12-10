---
description: "Task list for Internal LMS Core implementation"
---

# Tasks: Internal LMS Core

**Input**: Design documents from `/specs/001-internal-lms-core/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize the .NET Aspire solution and SvelteKit application structure.

- [x] T001 Create .NET Aspire solution structure (`DrillSkill.sln`, `DrillSkill.AppHost`, `DrillSkill.ServiceDefaults`)
- [x] T002 Initialize SvelteKit project in `src/DrillSkill.Web` with TypeScript
- [x] T003 [P] Configure Tailwind CSS in `src/DrillSkill.Web`
- [x] T004 Configure Aspire AppHost to include Postgres and Redis resources
- [x] T005 Configure Aspire AppHost to orchestrate `DrillSkill.Web` as an NPM app
- [x] T006 Configure environment variable injection (`DATABASE_URL`, `REDIS_URL`) from Aspire to SvelteKit

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure (Database, Auth, Base UI) required for all user stories.

- [x] T007 Install Prisma 7 and initialize `prisma/schema.prisma` in `src/DrillSkill.Web`
- [x] T008 Define `User`, `Session`, `Account` models in `schema.prisma` (per data-model.md)
- [x] T009 Define `Course`, `Section`, `Enrollment`, `Exam`, `Result` models in `schema.prisma`
- [x] T010 [P] Install and configure Better-Auth with Prisma adapter in `src/DrillSkill.Web/src/lib/server/auth.ts`
- [x] T011 Create SvelteKit hooks (`src/hooks.server.ts`) for auth session management
- [x] T012 [P] Create base layout (`src/routes/+layout.svelte`) with Navbar and Footer components
- [x] T013 Run initial Prisma migration to create database tables

## Phase 3: User Story 1 - Learner Registration & Enrollment (Priority: P1) 🎯 MVP

**Goal**: Users can sign up, view courses, and enroll.

**Independent Test**: Register a new user, navigate to catalog, enroll in an auto-enroll course.

### Tests for User Story 1 (OPTIONAL)
- [ ] T014 [P] [US1] Create E2E test for User Registration flow in `tests/e2e/auth.test.ts`
- [ ] T015 [P] [US1] Create E2E test for Course Enrollment flow in `tests/e2e/enrollment.test.ts`

### Implementation for User Story 1
- [x] T016 [P] [US1] Create Registration page (`src/routes/auth/register/+page.svelte`) and form action
- [x] T017 [P] [US1] Create Login page (`src/routes/auth/login/+page.svelte`) and form action
- [x] T018 [US1] Implement Course Catalog page (`src/routes/courses/+page.svelte`) listing available courses
- [x] T019 [US1] Implement Course Detail page (`src/routes/courses/[id]/+page.svelte`) with "Enroll" button
- [x] T020 [US1] Implement Enrollment form action in `src/routes/courses/[id]/+page.server.ts` (handle Auto-Enroll vs Invite)
- [x] T021 [US1] Create Dashboard page (`src/routes/dashboard/+page.svelte`) showing enrolled courses

**Checkpoint**: User can register, login, see courses, and enroll.

## Phase 4: User Story 2 - AI-Assisted Course Creation (Priority: P2)

**Goal**: Course Owners can generate course structures using AI.

**Independent Test**: Course Owner enters topic, AI generates outline, Course is saved to DB.

### Implementation for User Story 2
- [ ] T022 [P] [US2] Install OpenAI Node.js SDK and configure API key in `src/DrillSkill.Web`
- [ ] T023 [P] [US2] Create API endpoint `src/routes/api/courses/generate/+server.ts` for AI generation
- [ ] T024 [US2] Create "Create Course" Wizard UI (`src/routes/courses/create/+page.svelte`)
- [ ] T025 [US2] Implement UI logic to call AI endpoint and display generated outline
- [ ] T026 [US2] Implement "Save Course" form action to persist Course and Sections to DB

**Checkpoint**: Course Owner can create a course with AI assistance.

## Phase 5: User Story 3 - Structured Learning & Gating (Priority: P2)

**Goal**: Learners can navigate course content and are blocked by prerequisites.

**Independent Test**: Verify access to Section B is denied until Section A is complete.

### Implementation for User Story 3
- [ ] T027 [P] [US3] Create Course Viewer layout (`src/routes/courses/[id]/learn/+layout.svelte`) with sidebar navigation
- [ ] T028 [US3] Implement Section Viewer page (`src/routes/courses/[id]/learn/[sectionId]/+page.svelte`) rendering Markdown content
- [ ] T029 [US3] Implement "Mark Complete" form action in Section Viewer
- [ ] T030 [US3] Implement server-side check for prerequisites in `load` function (redirect if locked)
- [ ] T031 [US3] Add visual indicators for Locked/Completed sections in the sidebar

**Checkpoint**: Learners can take courses and gating logic is enforced.

## Phase 6: User Story 4 - Exams & Results (Priority: P3)

**Goal**: Assessments and grading.

**Independent Test**: Learner takes exam, score is recorded, Owner sees result.

### Implementation for User Story 4
- [ ] T032 [P] [US4] Create Exam Editor UI component for Course Owners
- [ ] T033 [US4] Create Exam Taker UI (`src/routes/courses/[id]/learn/[sectionId]/exam/+page.svelte`)
- [ ] T034 [US4] Implement Exam submission and grading logic (server-side)
- [ ] T035 [US4] Create Results Dashboard (`src/routes/courses/[id]/results/+page.svelte`) for Course Owners
- [ ] T036 [US4] Update Course Completion logic to check for passed exams

**Checkpoint**: Full LMS loop with assessments.

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and documentation.

- [ ] T037 [P] Update `README.md` with setup instructions
- [ ] T038 [P] Add error pages (`+error.svelte`) for 404/403/500
- [ ] T039 Verify all "Constitution" requirements (Linting, Accessibility check)
- [ ] T040 Run full E2E test suite

## Dependencies & Execution Order

- **Phase 1 & 2** must be completed first.
- **Phase 3 (US1)** is the MVP.
- **Phase 4 (US2)** and **Phase 5 (US3)** can be parallelized after Phase 3.
- **Phase 6 (US4)** depends on Phase 5 (needs Section structure).

## Parallel Execution Examples

**User Story 1 (Registration)**:
```bash
# Developer A: Auth Pages
Task: T016 Create Registration page
Task: T017 Create Login page

# Developer B: Course Catalog
Task: T018 Implement Course Catalog page
Task: T019 Implement Course Detail page
```
