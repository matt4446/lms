import { json } from '@sveltejs/kit';
import { ExportJob } from '$lib/server/jobs/export-job';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Check if user owns the course or has permission

  try {
    const exportId = await ExportJob.start(params.verId);
    return json({ success: true, exportId });
  } catch (error) {
    console.error(error);
    return json({ error: 'Failed to start export' }, { status: 500 });
  }
};
