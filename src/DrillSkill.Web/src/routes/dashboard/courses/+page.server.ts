import { redirect } from '@sveltejs/kit';
import { courseService } from '$lib/server/courses/service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect(302, '/auth/signin');
  }

  const courses = await courseService.listCourses(session.user.id);

  return {
    courses
  };
};
