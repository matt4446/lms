import { prisma } from '$lib/server/db';
import { storageService } from '$lib/server/storage';
import { uploadSessionService } from '$lib/server/storage/upload-session';

export class CleanupJob {
  static async run() {
    console.log('Starting cleanup job...');
    
    // 1. Cleanup Upload Sessions
    const cleanedSessions = await uploadSessionService.cleanupExpiredSessions();
    console.log(`Cleaned up ${cleanedSessions} expired upload sessions.`);

    // 2. Cleanup Old Exports (e.g., older than 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const oldExports = await prisma.courseExport.findMany({
      where: {
        createdAt: { lt: yesterday },
        status: { in: ['COMPLETED', 'FAILED'] } // Don't delete PENDING/PROCESSING
      }
    });

    let cleanedExports = 0;
    for (const exp of oldExports) {
      try {
        if (exp.filePath && await storageService.exists(exp.filePath)) {
          await storageService.deleteFile(exp.filePath);
        }
        await prisma.courseExport.delete({ where: { id: exp.id } });
        cleanedExports++;
      } catch (e) {
        console.error(`Failed to cleanup export ${exp.id}`, e);
      }
    }
    
    console.log(`Cleaned up ${cleanedExports} old exports.`);
  }
}
