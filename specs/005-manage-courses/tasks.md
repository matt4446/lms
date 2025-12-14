# Tasks: Manage Courses

**Feature**: Manage Courses (005)
**Spec**: [specs/005-manage-courses/spec.md](specs/005-manage-courses/spec.md)
**Plan**: [specs/005-manage-courses/plan.md](specs/005-manage-courses/plan.md)

## Phase 1: Setup
*Goal: Initialize data models and storage infrastructure.*

- [x] T001 Update Prisma schema with Course, CourseVersion, CourseExport in `src/DrillSkill.Web/prisma/schema.prisma`
- [x] T002 [P] Configure storage volume for uploads in `src/DrillSkill.AppHost/AppHost.cs`
- [x] T003 [P] Create storage service abstraction in `src/DrillSkill.Web/src/lib/server/storage/index.ts`

## Phase 2: Foundational
*Goal: Core service logic and file handling infrastructure.*

- [x] T004 Implement CourseService skeleton with types in `src/DrillSkill.Web/src/lib/server/courses/service.ts`
- [x] T005 Implement chunked upload API handler in `src/DrillSkill.Web/src/routes/api/uploads/chunk/+server.ts`
- [x] T006 Implement upload session management logic in `src/DrillSkill.Web/src/lib/server/storage/upload-session.ts`

## Phase 3: User Story 1 - Create New Course (P1)
*Goal: Instructors can create a new course shell.*
*Independent Test: Create a course via UI and verify it appears in the database.*

- [x] T007 [US1] Implement `createCourse` method in `src/DrillSkill.Web/src/lib/server/courses/service.ts`
- [x] T008 [US1] Create course list page (dashboard) in `src/DrillSkill.Web/src/routes/dashboard/courses/+page.svelte`
- [x] T009 [US1] Create course creation form in `src/DrillSkill.Web/src/routes/courses/create/+page.svelte`
- [x] T010 [US1] Implement form action for creation in `src/DrillSkill.Web/src/routes/courses/create/+page.server.ts`
- [x] T011 [US1] Add E2E test for course creation in `src/DrillSkill.Web/tests/e2e/courses/create.test.ts`

## Phase 4: User Story 2 - Edit Course Details (P1)
*Goal: Instructors can update course metadata.*
*Independent Test: Edit course title/description and verify persistence.*

- [x] T012 [US2] Implement `updateCourseVersion` method in `src/DrillSkill.Web/src/lib/server/courses/service.ts`
- [x] T013 [US2] Create course editor layout in `src/DrillSkill.Web/src/routes/courses/[id]/(manage)/+layout.svelte`
- [x] T014 [US2] Create metadata edit form in `src/DrillSkill.Web/src/routes/courses/[id]/(manage)/edit/+page.svelte`
- [x] T015 [US2] Implement form action for updates in `src/DrillSkill.Web/src/routes/courses/[id]/(manage)/edit/+page.server.ts`
- [x] T016 [US2] Add E2E test for editing course in `src/DrillSkill.Web/tests/e2e/courses/edit.test.ts`

## Phase 5: User Story 3 - Export Course (P2)
*Goal: Instructors can download course content as ZIP.*
*Independent Test: Trigger export and download valid ZIP file.*

- [x] T017 [US3] Implement export logic (ZIP generation) in `src/DrillSkill.Web/src/lib/server/courses/export.ts`
- [x] T018 [US3] Create export job tracker in `src/DrillSkill.Web/src/lib/server/jobs/export-job.ts`
- [x] T019 [US3] Create export UI in `src/DrillSkill.Web/src/routes/courses/[id]/(manage)/export/+page.svelte`
- [x] T020 [US3] Implement export trigger endpoint in `src/DrillSkill.Web/src/routes/api/courses/[id]/versions/[verId]/export/+server.ts`
- [x] T021 [US3] Implement download endpoint in `src/DrillSkill.Web/src/routes/api/downloads/[jobId]/+server.ts`
- [x] T022 [US3] Add E2E test for export in `src/DrillSkill.Web/tests/e2e/courses/export.test.ts`

## Phase 6: User Story 4 - Import Course (P2)
*Goal: Instructors can restore courses from ZIP files.*
*Independent Test: Upload ZIP and verify course creation.*

- [x] T023 [US4] Implement import logic (Unzip/Validate) in `src/DrillSkill.Web/src/lib/server/courses/import.ts`
- [x] T024 [US4] Create import UI with chunked uploader in `src/DrillSkill.Web/src/routes/courses/import/+page.svelte`
- [x] T025 [US4] Implement import finalization endpoint in `src/DrillSkill.Web/src/routes/api/courses/import/finalize/+server.ts`
- [x] T026 [US4] Add E2E test for import in `src/DrillSkill.Web/tests/e2e/courses/import.test.ts`

## Phase 7: User Story 5 - Manage Versions (P2)
*Goal: Instructors can manage drafts and published versions.*
*Independent Test: Publish a draft, create new draft, switch versions.*

- [x] T027 [US5] Implement `publishVersion` method in `src/DrillSkill.Web/src/lib/server/courses/service.ts`
- [x] T028 [US5] Implement `createDraftFromPublished` method in `src/DrillSkill.Web/src/lib/server/courses/service.ts`
- [x] T029 [US5] Create version history UI in `src/DrillSkill.Web/src/routes/courses/[id]/(manage)/versions/+page.svelte`
- [x] T030 [US5] Implement version switching actions in `src/DrillSkill.Web/src/routes/courses/[id]/(manage)/versions/+page.server.ts`
- [x] T031 [US5] Add E2E test for versioning in `src/DrillSkill.Web/tests/e2e/courses/versioning.test.ts`

## Phase 8: Polish
*Goal: Robustness and cleanup.*

- [x] T032 [P] Add error handling for failed uploads in `src/DrillSkill.Web/src/lib/server/storage/upload-session.ts`
- [x] T033 [P] Implement cleanup job for old exports/uploads in `src/DrillSkill.Web/src/lib/server/jobs/cleanup.ts`

## Dependencies

1. **US1 (Create)**: Depends on Phase 1 & 2.
2. **US2 (Edit)**: Depends on US1.
3. **US3 (Export)**: Depends on US2 (need content to export).
4. **US4 (Import)**: Depends on Phase 2 (upload infra).
5. **US5 (Versions)**: Depends on US2.

## Parallel Execution Examples

- **Frontend/Backend**: T008 (List UI) and T007 (Service) can be started in parallel.
- **Stories**: US3 (Export) and US4 (Import) are largely independent once Phase 2 is done.
- **Polish**: T033 (Cleanup) can be done anytime after Phase 2.

## Implementation Strategy

1. **MVP**: Complete Phases 1-4 to allow creating and editing courses.
2. **Data Portability**: Complete Phases 5-6 to allow backup/restore.
3. **Advanced**: Complete Phase 7 for version control.
