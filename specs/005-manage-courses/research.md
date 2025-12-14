# Research: Manage Courses

**Feature**: Manage Courses (005)
**Date**: 2025-12-11

## 1. Chunked Uploads for Large Files (<2GB)

**Problem**: Standard HTTP uploads fail with large files due to timeouts and memory limits.
**Requirement**: Support 2GB uploads, resumable, with progress.

**Options**:
1.  **Tus Protocol (tus-js-client + tus-node-server)**:
    -   *Pros*: Industry standard, resumable, robust.
    -   *Cons*: Requires a separate server or complex integration with SvelteKit node adapter.
2.  **Custom Chunked Upload (SvelteKit API)**:
    -   *Pros*: No extra dependencies, full control.
    -   *Cons*: Re-inventing the wheel, handling edge cases (retries, reassembly) is hard.
3.  **Direct-to-Storage (Signed URLs)**:
    -   *Pros*: Offloads traffic from app server.
    -   *Cons*: Requires S3-compatible storage (MinIO/AWS). We are currently using local volumes.

**Decision**: **Option 2 (Custom Chunked Upload)** or **Option 1 (Tus)** if a lightweight adapter exists.
*Refinement*: Since we are using `DrillSkill.Web` (Node/SvelteKit), we can implement a simple chunked upload endpoint that appends to a file on disk.
*Selected Approach*: **Custom Chunked Upload** using `ReadableStream` in SvelteKit actions/endpoints. We will slice the file on the client and send chunks.

## 2. Course Versioning Data Model

**Problem**: Need to edit a draft while a published version remains active.
**Requirement**: Publish specific versions, revert capability.

**Options**:
1.  **Single Table with Status**: `Course` has `status` (draft/published).
    -   *Cons*: Can't have both draft and published at the same time easily without duplicating rows.
2.  **Head + History**: `Course` (metadata, pointer to current published version) + `CourseVersion` (content snapshots).
    -   *Pros*: Clear separation. `Course` ID stays constant.
    -   *Cons*: Data duplication for every version.
3.  **Draft Column**: `Course` has `publishedContent` and `draftContent` columns (JSON).
    -   *Pros*: Simple.
    -   *Cons*: Hard to query inside the JSON. No history.

**Decision**: **Option 2 (Head + History)**.
-   `Course`: ID, Title, Description (current draft metadata), `publishedVersionId` (FK).
-   `CourseVersion`: ID, CourseID, VersionNumber, Title, Description, Content (JSON), CreatedAt.
-   *Workflow*: Editing happens on `Course` (Draft). "Publish" creates a new `CourseVersion` snapshot and updates `publishedVersionId`.
-   *Wait*: If we want to edit a *new* draft while keeping the *old* published, we need a place to store the draft.
-   *Refined Model*:
    -   `Course`: ID, `publishedVersionId` (FK to CourseVersion).
    -   `CourseVersion`: ID, CourseID, VersionNumber, Status (Draft/Published/Archived), Content.
    -   *Constraint*: Only one "Draft" version per course allowed.
    -   *Workflow*:
        -   Create Course -> Creates `Course` + `CourseVersion` (v1, Draft).
        -   Publish -> Updates `CourseVersion` (v1, Published), sets `Course.publishedVersionId` = v1.
        -   Edit -> If current version is Published, create new `CourseVersion` (v2, Draft) copy of v1. Edit v2.
        -   Publish v2 -> Updates v2 to Published, `Course.publishedVersionId` = v2. v1 remains Published (or Archived?).

## 3. Export Format

**Problem**: Need a portable format.
**Requirement**: Custom JSON/ZIP.

**Decision**: **ZIP Archive**.
-   `manifest.json`: Metadata (ID, Title, Version, CreatedAt).
-   `content.json`: The structured content (modules, lessons).
-   `assets/`: Folder containing images/videos referenced in content.

## 4. Storage Strategy

**Problem**: Where to store 2GB files?
**Context**: .NET Aspire setup with `DrillSkill.Web`.

**Decision**: **Local Volume**.
-   We need to configure a volume for `DrillSkill.Web` in `AppHost.cs` to persist uploads across restarts.
-   Path: `/app/data/uploads` (or similar).

## 5. Large Export Handling

**Problem**: Generating a 2GB ZIP in memory will crash the node process.
**Requirement**: Stream the ZIP generation.

**Decision**: **Stream Archiving**.
-   Use `archiver` (npm) to stream the ZIP output directly to the HTTP response (or to a temp file first, then download).
-   *Recommendation*: Write to temp file first to allow resumable downloads/retries, then serve via `readStream`.

