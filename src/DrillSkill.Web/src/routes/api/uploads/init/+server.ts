import { json } from '@sveltejs/kit';
import { uploadSessionService, initUploadSchema } from '$lib/server/storage/upload-session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = initUploadSchema.parse(body);
    
    const uploadSession = await uploadSessionService.createSession(session.user.id, data);
    
    return json({ uploadId: uploadSession.id });
  } catch (error) {
    console.error(error);
    return json({ error: 'Invalid request' }, { status: 400 });
  }
};
