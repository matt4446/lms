import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { courseService } from '$lib/server/courses/service';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session) throw error(401, 'Unauthorized');

  const course = await courseService.getCourse(params.id);
  if (!course) throw error(404, 'Course not found');

  if (course.ownerId !== session.user.id) throw error(403, 'Forbidden');

  return {
    course
  };
};

export const actions: Actions = {
  publish: async ({ params, request, locals }) => {
    const session = await locals.auth.getSession({ headers: request.headers });
    if (!session) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const versionId = formData.get('versionId') as string;

    if (!versionId) return fail(400, { message: 'Version ID required' });

    try {
      await courseService.publishVersion(params.id, versionId);
      return { success: true };
    } catch (e: any) {
      return fail(500, { message: e.message });
    }
  },

  createDraft: async ({ params, request, locals }) => {
    const session = await locals.auth.getSession({ headers: request.headers });
    if (!session) return fail(401, { message: 'Unauthorized' });

    try {
      const draft = await courseService.createDraftFromPublished(params.id);
      // Redirect to edit page for the new draft? Or just stay here?
      // Staying here allows user to see the new draft in the list.
      return { success: true, draftId: draft.id };
    } catch (e: any) {
      return fail(500, { message: e.message });
    }
  }
};
