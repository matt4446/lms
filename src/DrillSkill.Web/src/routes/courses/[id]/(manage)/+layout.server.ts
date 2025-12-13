import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { courseService } from '$lib/server/courses/service';

export const load: LayoutServerLoad = async ({ params, locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const course = await courseService.getCourse(params.id);
  if (!course) {
    throw error(404, 'Course not found');
  }

  if (course.ownerId !== session.user.id) {
    throw error(403, 'Forbidden');
  }

  return {
    course
  };
};
