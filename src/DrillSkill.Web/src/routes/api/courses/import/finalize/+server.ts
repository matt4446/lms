import { json } from '@sveltejs/kit';
import { uploadSessionService } from '$lib/server/storage/upload-session';
import { CourseImporter } from '$lib/server/courses/import';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({
      headers: request.headers
  });

  if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId, options } = await request.json();

  if (!uploadId) {
    return json({ error: 'Missing uploadId' }, { status: 400 });
  }

  try {
    // 1. Finalize Upload
    const fileName = await uploadSessionService.finalizeSession(uploadId);

    // 2. Run Import Logic
    const courseId = await CourseImporter.importCourse(fileName, session.user.id, options);

    return json({ success: true, courseId });
  } catch (error) {
    console.error('Import failed:', error);
    return json({ error: 'Import failed' }, { status: 500 });
  }
};
