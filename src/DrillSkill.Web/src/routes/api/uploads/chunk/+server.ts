import { json } from '@sveltejs/kit';
import { uploadSessionService } from '$lib/server/storage/upload-session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  // Optional: Validate auth
  const authSession = await locals.auth.getSession({ headers: request.headers });
  if (!authSession) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uploadId = request.headers.get('X-Upload-Id');
  
  if (!uploadId) {
    return json({ error: 'Missing X-Upload-Id header' }, { status: 400 });
  }

  // We could verify authSession.user.id matches session.userId here if we wanted strict ownership check

  try {
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return json({ error: 'Empty chunk' }, { status: 400 });
    }

    const updatedSession = await uploadSessionService.appendChunk(uploadId, buffer);

    return json({ 
      success: true, 
      uploadedSize: updatedSession.uploadedSize 
    });
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 404 });
  }
};
