import { prisma } from '$lib/server/db';
import { storageService } from '$lib/server/storage';
import yauzl from 'yauzl';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { mkdtemp, readFile, rm, mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Prisma } from '@prisma/client';

// Types for Manifest and Content
interface ImportManifest {
  version: string;
  course: {
    id: string;
    title: string;
    description: string;
    version: number;
    exportedAt: string;
  };
}

export interface ImportOptions {
  strategy: 'CREATE' | 'OVERWRITE';
  targetCourseId?: string;
  include: {
    metadata: boolean;
    content: boolean;
    users: boolean;
    results: boolean;
  };
}

export class CourseImporter {
  /**
   * Imports a course from a ZIP file stored in the storage service.
   * @param fileName The filename of the ZIP in storage (e.g. "imports/xyz.zip")
   * @param userId The ID of the user performing the import
   * @param options Import options (strategy, what to include)
   */
  static async importCourse(fileName: string, userId: string, options?: ImportOptions): Promise<string> {
    // Default options
    const opts: ImportOptions = options || {
      strategy: 'CREATE',
      include: { metadata: true, content: true, users: false, results: false }
    };

    const zipFilePath = storageService.getFilePath(fileName);
    
    // Create a temporary directory for extraction
    const extractDir = await mkdtemp(join(tmpdir(), 'import-'));

    try {
      // 1. Extract Zip
      await this.extractZip(zipFilePath, extractDir);

      // 2. Read Manifest
      const manifestPath = join(extractDir, 'manifest.json');
      let manifestRaw: string;
      try {
        manifestRaw = await readFile(manifestPath, 'utf-8');
      } catch (e) {
        throw new Error('Invalid course package: manifest.json missing');
      }
      
      const manifest: ImportManifest = JSON.parse(manifestRaw);
      let courseId: string;
      let versionId: string;

      // 3. Handle Course Creation / Update
      if (opts.strategy === 'OVERWRITE' && opts.targetCourseId) {
        // Verify ownership
        const existingCourse = await prisma.course.findUnique({
          where: { id: opts.targetCourseId },
          include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
        });

        if (!existingCourse) throw new Error('Target course not found');
        if (existingCourse.ownerId !== userId) throw new Error('Unauthorized to overwrite this course');

        courseId = existingCourse.id;

        // Update Metadata if requested
        if (opts.include.metadata) {
          await prisma.course.update({
            where: { id: courseId },
            data: {
              title: manifest.course.title,
              description: manifest.course.description
            }
          });
        }

        // Determine Version to update
        const latestVersion = existingCourse.versions[0];
        
        if (latestVersion && latestVersion.status === 'DRAFT') {
           versionId = latestVersion.id;
           // Update version metadata too if requested
           if (opts.include.metadata) {
             await prisma.courseVersion.update({
               where: { id: versionId },
               data: {
                 title: manifest.course.title,
                 description: manifest.course.description
               }
             });
           }
        } else {
           // Create new draft
           const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;
           const newVersion = await prisma.courseVersion.create({
             data: {
               courseId,
               versionNumber: newVersionNumber,
               title: opts.include.metadata ? manifest.course.title : (latestVersion?.title || 'Imported Version'),
               description: opts.include.metadata ? manifest.course.description : latestVersion?.description,
               status: 'DRAFT',
               content: latestVersion?.content ?? Prisma.JsonNull
             }
           });
           versionId = newVersion.id;
        }

      } else {
        // CREATE NEW
        const course = await prisma.course.create({
          data: {
            title: manifest.course.title + ' (Imported)',
            description: manifest.course.description,
            ownerId: userId,
            publishedVersionId: null,
            versions: {
              create: {
                versionNumber: 1,
                title: manifest.course.title,
                description: manifest.course.description,
                status: 'DRAFT',
                content: {}, 
              }
            }
          },
          include: {
              versions: true
          }
        });
        courseId = course.id;
        versionId = course.versions[0].id;
      }

      // 4. Import Content
      if (opts.include.content) {
        const contentPath = join(extractDir, 'content.json');
        try {
          const contentRaw = await readFile(contentPath, 'utf-8');
          const content = JSON.parse(contentRaw);
          
          await prisma.courseVersion.update({
              where: { id: versionId },
              data: { content }
          });
        } catch (e) {
            console.warn('No content.json found or invalid', e);
        }
      }

      return courseId;

    } finally {
      // Cleanup temp dir
      await rm(extractDir, { recursive: true, force: true });
    }
  }

  private static extractZip(zipPath: string, destDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) return reject(err);
        
        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry - skip, we create dirs on demand for files
            zipfile.readEntry();
          } else {
            // File
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);
              
              const safeFileName = join(destDir, entry.fileName);
              
              // Security: Prevent directory traversal (Zip Slip)
              if (!safeFileName.startsWith(destDir)) {
                  return reject(new Error('Malicious zip file: path traversal detected'));
              }

              // Ensure parent dir exists
              const parentDir = dirname(safeFileName);
              mkdir(parentDir, { recursive: true }).then(() => {
                  const writeStream = createWriteStream(safeFileName);
                  readStream.pipe(writeStream);
                  
                  writeStream.on('close', () => {
                    zipfile.readEntry();
                  });
                  writeStream.on('error', reject);
              }).catch(reject);
            });
          }
        });

        zipfile.on('end', resolve);
        zipfile.on('error', reject);
      });
    });
  }
}
