import { fail, redirect } from '@sveltejs/kit';
import { courseService } from '$lib/server/courses/service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { course } = await parent();
  return {
    course
  };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    const session = await locals.auth.getSession({ headers: request.headers });
    if (!session?.user) {
      throw redirect(302, '/auth/signin');
    }

    const formData = await request.formData();
    const versionId = formData.get('versionId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;

    if (!versionId || !title) {
      return fail(400, { message: 'Missing required fields' });
    }

    try {
      await courseService.updateCourseVersion(versionId, {
        title,
        description,
        startDate: startDateStr ? new Date(startDateStr) : null,
        endDate: endDateStr ? new Date(endDateStr) : null
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      return fail(500, { message: 'Failed to update course' });
    }
  }
};
