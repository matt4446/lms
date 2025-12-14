import { prisma } from '$lib/server/db';
import { storageService } from '$lib/server/storage';
import archiver from 'archiver';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readFile, unlink } from 'node:fs/promises';

export class CourseExporter {
  static async initiateExport(versionId: string): Promise<string> {
    // 1. Create Export Record
    const exportRecord = await prisma.courseExport.create({
      data: {
        courseVersionId: versionId,
        filePath: '', // Will update later
        fileSize: 0,
        status: 'PROCESSING'
      }
    });

    // Start processing in background
    this.processExport(exportRecord.id, versionId).catch(err => {
      console.error(`Export failed for ${exportRecord.id}`, err);
    });

    return exportRecord.id;
  }

  private static async processExport(exportId: string, versionId: string) {
    try {
      // 2. Fetch Data
      const version = await prisma.courseVersion.findUnique({
        where: { id: versionId },
        include: { course: true }
      });

      if (!version) throw new Error('Version not found');

      // 3. Generate ZIP
      const zipPath = join(tmpdir(), `export-${exportId}.zip`);
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      await new Promise<void>((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);

        // Add Manifest
        const manifest = {
          version: '1.0',
          course: {
            id: version.courseId,
            title: version.title,
            description: version.description,
            version: version.versionNumber,
            exportedAt: new Date().toISOString()
          }
        };
        archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

        // Add Content
        if (version.content) {
            archive.append(JSON.stringify(version.content, null, 2), { name: 'content.json' });
        }

        // TODO: Add assets if any (cover image, etc.)

        archive.finalize();
      });

      // 4. Upload to Storage
      const fileBuffer = await readFile(zipPath);
      const storedPath = `exports/${version.courseId}/${version.versionNumber}.zip`;
      
      await storageService.saveFile(storedPath, fileBuffer);

      // 5. Update Record
      await prisma.courseExport.update({
        where: { id: exportId },
        data: {
          status: 'COMPLETED',
          filePath: storedPath,
          fileSize: BigInt(fileBuffer.length),
          completedAt: new Date()
        }
      });

      // Cleanup
      await unlink(zipPath);

    } catch (error) {
      console.error('Export failed:', error);
      await prisma.courseExport.update({
        where: { id: exportId },
        data: { status: 'FAILED' }
      });
      // We don't rethrow here because it's a background process
    }
  }
}
