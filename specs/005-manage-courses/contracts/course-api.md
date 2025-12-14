# API Contracts: Manage Courses

**Feature**: 005-manage-courses

## Course Management

### Create Course
**Endpoint**: `POST /api/courses` (or Form Action `?/create`)
**Input**:
```json
{
  "title": "Introduction to Drilling",
  "description": "Basic safety and operations."
}
```
**Output**:
```json
{
  "id": "course_123",
  "versionId": "ver_001",
  "status": "DRAFT"
}
```
**Logic**: Creates `Course` and initial `CourseVersion` (v1).

### Update Draft
**Endpoint**: `PUT /api/courses/[id]/versions/[verId]` (or Form Action `?/update`)
**Input**:
```json
{
  "title": "Updated Title",
  "content": { ... }
}
```
**Logic**: Updates the specified version. Fails if version is not DRAFT.

### Publish Version
**Endpoint**: `POST /api/courses/[id]/versions/[verId]/publish` (or Form Action `?/publish`)
**Logic**:
1. Sets `CourseVersion.status` = `PUBLISHED`.
2. Sets `Course.publishedVersionId` = `verId`.
3. (Optional) Archives previous published version.

### Create New Draft
**Endpoint**: `POST /api/courses/[id]/versions`
**Logic**:
1. Copies content from `publishedVersionId` (or latest version).
2. Creates new `CourseVersion` with `versionNumber` + 1.
3. Sets status to `DRAFT`.

## Import / Export

### Trigger Export
**Endpoint**: `POST /api/courses/[id]/versions/[verId]/export`
**Output**:
```json
{
  "jobId": "job_abc",
  "status": "PENDING"
}
```

### Check Export Status
**Endpoint**: `GET /api/jobs/[jobId]`
**Output**:
```json
{
  "status": "COMPLETED",
  "progress": 100,
  "downloadUrl": "/api/downloads/export_123.zip"
}
```

### Upload Import Chunk
**Endpoint**: `POST /api/uploads/chunk`
**Headers**:
- `X-Upload-Id`: Unique session ID
- `X-Chunk-Index`: 0, 1, 2...
- `Content-Range`: bytes 0-1048575/20971520
**Body**: Binary chunk data.

### Finalize Import
**Endpoint**: `POST /api/courses/import/finalize`
**Input**:
```json
{
  "uploadId": "upload_xyz",
  "strategy": "CREATE_NEW" | "OVERWRITE",
  "targetCourseId": "course_123" (optional)
}
```
