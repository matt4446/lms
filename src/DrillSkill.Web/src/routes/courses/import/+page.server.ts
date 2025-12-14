import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { courseService } from '$lib/server/courses/service';

export const load: PageServerLoad = async ({ locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session) throw error(401, 'Unauthorized');

  const courses = await courseService.listCourses(session.user.id);

  return {
    courses: courses.map(c => ({
      id: c.id,
      title: c.title
    }))
  };
};
