import { fail, redirect } from '@sveltejs/kit';
import { courseService } from '$lib/server/courses/service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect(302, '/auth/signin');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const session = await locals.auth.getSession({ headers: request.headers });
    if (!session?.user) {
      throw redirect(302, '/auth/signin');
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title) {
      return fail(400, { title, description, missing: true });
    }

    let course;

    try {
      course = await courseService.createCourse({
        title,
        description,
        ownerId: session.user.id
      });
    } catch (error) {
      console.error(error);
      return fail(500, { message: 'Failed to create course' });
    }

    throw redirect(303, `/courses/${course.id}/content`);
  }
};
