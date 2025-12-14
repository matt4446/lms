# Implementation Plan: Manage Courses

**Branch**: `005-manage-courses` | **Date**: 2025-12-11 | **Spec**: [specs/005-manage-courses/spec.md](specs/005-manage-courses/spec.md)
**Input**: Feature specification from `specs/005-manage-courses/spec.md`

## Summary

Implement comprehensive course management capabilities for instructors, including Create, Edit, Delete (with mandatory export), Import, and Export. The feature supports large file handling (<2GB) via chunked uploads/downloads, maintains a history of exports, and introduces course versioning to allow publishing specific versions while working on drafts.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js (LTS)
**Primary Dependencies**: SvelteKit, Prisma, TailwindCSS, Zod (validation)
**Storage**: PostgreSQL (via Prisma), Redis (optional, for job tracking)
**Testing**: Playwright (E2E), Vitest (Unit)
**Target Platform**: Web (SvelteKit adapter-node)
**Project Type**: Web Application (SvelteKit)
**Performance Goals**: Support 2GB file uploads/exports; Import/Export < 1 min for 50MB.
**Constraints**: Must handle unstable connections (resumable uploads); Data integrity during version switching.
**Scale/Scope**: Course data model, Versioning logic, File handling infrastructure.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: Logic for course management (CRUD, Versioning, Import/Export) should be encapsulated in `lib/server/courses/` modules, independent of the UI.
- **CLI Interface**: N/A for this specific feature iteration, though the service layer should be callable from scripts.
- **Test-First**: Mandatory. Unit tests for the `CourseService` and E2E tests for the UI flows.
- **Integration Testing**: Critical for file system/storage interactions and database transactions (especially versioning).
- **Observability**: Progress tracking for long-running import/export jobs is required.

**Status**: PASSED

## Project Structure

### Documentation (this feature)

```text
specs/005-manage-courses/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/DrillSkill.Web/
├── prisma/
│   └── schema.prisma           # Update: Add Course, CourseVersion, CourseExport models
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── courses/        # New: Course domain logic
│   │   │   │   ├── service.ts  # Core CRUD & Versioning
│   │   │   │   ├── import.ts   # Import logic
│   │   │   │   └── export.ts   # Export logic
│   │   │   └── storage/        # New: File storage abstraction
│   └── routes/
│       └── courses/            # Updated: Course Management UI moved here
│           ├── +page.svelte    # Catalog (existing)
│           ├── create/         # Create Course
│           └── [id]/
│               ├── (manage)/   # Management Group
│               │   ├── edit/
│               │   ├── settings/
│               │   └── export/
│               ├── +page.svelte # Student View
│       └── dashboard/
│           └── courses/        # Instructor Course List
│               ├── +page.svelte
│               └── +page.server.ts
```

**Structure Decision**: Domain logic separated into `lib/server/courses` to keep routes clean. Storage abstraction added for file handling.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Course Versioning | User requirement for safe updates | Single version risks breaking live courses during edits |
| Chunked Uploads | Support for 2GB files | Standard form uploads fail/timeout with large files |
