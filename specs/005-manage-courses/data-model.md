# Data Model: Manage Courses

**Feature**: 005-manage-courses

## Prisma Schema Updates

```prisma
model Course {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  versions          CourseVersion[]
  publishedVersion  CourseVersion?  @relation("PublishedVersion", fields: [publishedVersionId], references: [id])
  publishedVersionId String?        @unique // One published version per course (active head)
  
  // Note: We might want a "DraftVersion" pointer too, or just query for status=DRAFT
}

model CourseVersion {
  id            String    @id @default(cuid())
  versionNumber Int
  status        VersionStatus @default(DRAFT)
  
  // Metadata
  title         String
  description   String?
  coverImage    String?
  startDate     DateTime?
  endDate       DateTime?
  
  // Content
  content       Json?     // Structured content (Modules, Lessons)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  course        Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  courseId      String
  
  exports       CourseExport[]
  
  // Reverse relation for the published pointer
  publishedFor  Course?   @relation("PublishedVersion")

  @@unique([courseId, versionNumber])
}

model CourseExport {
  id              String        @id @default(cuid())
  filePath        String
  fileSize        BigInt
  status          ExportStatus  @default(PENDING)
  
  createdAt       DateTime      @default(now())
  completedAt     DateTime?

  // Relationships
  courseVersion   CourseVersion @relation(fields: [courseVersionId], references: [id], onDelete: Cascade)
  courseVersionId String
}

enum VersionStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ExportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

## Entity Descriptions

### Course
The container for a learning unit. It maintains the identity of the course across multiple versions.
- **publishedVersionId**: Points to the currently active version visible to learners.

### CourseVersion
A specific snapshot of the course content and metadata.
- **versionNumber**: Sequential integer (1, 2, 3...).
- **content**: JSON blob storing the hierarchy of modules and lessons.
- **status**:
    - `DRAFT`: Editable. Only one draft allowed per course usually.
    - `PUBLISHED`: Read-only (mostly). Visible to learners.
    - `ARCHIVED`: Old versions.

### CourseExport
Record of a generated export file.
- **filePath**: Path to the ZIP file on the server volume.
- **fileSize**: Size in bytes (BigInt for >2GB support).
