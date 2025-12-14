import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { courseService } from '$lib/server/courses/service';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ parent }) => {
  const { course } = await parent();
  // Get the latest version (draft or published)
  let latestVersion = course.versions[0];

  if (!latestVersion) {
    // Auto-repair: Create a draft version if none exists
    latestVersion = await prisma.courseVersion.create({
      data: {
        courseId: course.id,
        versionNumber: 1,
        title: course.title,
        description: course.description,
        status: 'DRAFT'
      }
    });
  }

  return {
    latestVersion
  };
};

export const actions: Actions = {
  update: async ({ request, params, locals }) => {
    const session = await locals.auth.getSession({ headers: request.headers });
    if (!session) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const versionId = formData.get('versionId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;

    if (!title) {
      return fail(400, { message: 'Title is required' });
    }

    try {
      await courseService.updateCourseVersion(versionId, {
        title,
        description,
        startDate: startDateStr ? new Date(startDateStr) : null,
        endDate: endDateStr ? new Date(endDateStr) : null
      });

      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { message: 'Failed to update course' });
    }
  }
};
