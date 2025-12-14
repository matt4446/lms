import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { storageService } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session?.user) {
    throw error(401, 'Unauthorized');
  }

  const exportRecord = await prisma.courseExport.findUnique({
    where: { id: params.jobId },
    include: {
      courseVersion: {
        include: {
          course: true
        }
      }
    }
  });

  if (!exportRecord) {
    throw error(404, 'Export not found');
  }

  // Check permission
  if (exportRecord.courseVersion.course.ownerId !== session.user.id) {
    throw error(403, 'Forbidden');
  }

  if (exportRecord.status !== 'COMPLETED') {
    throw error(400, 'Export not ready');
  }

  try {
    // Stream the file
    const stream = storageService.createReadStream(exportRecord.filePath);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="course-${exportRecord.courseVersion.course.title}-${exportRecord.courseVersion.versionNumber}.zip"`
      }
    });
  } catch (err) {
    console.error(err);
    throw error(500, 'Failed to download file');
  }
};
