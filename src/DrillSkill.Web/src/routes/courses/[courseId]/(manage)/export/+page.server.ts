import { redirect, fail } from '@sveltejs/kit';
import { courseService } from '$lib/server/courses/service';
import { ExportJob } from '$lib/server/jobs/export-job';
import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals, request }) => {
  const session = await locals.auth.getSession({ headers: request.headers });
  if (!session?.user) throw redirect(302, '/auth/signin');

  const course = await courseService.getCourse(params.courseId);
  if (!course) throw redirect(404, '/dashboard/courses');

  // Get all versions with their exports
  const versions = await prisma.courseVersion.findMany({
    where: { courseId: params.courseId },
    orderBy: { versionNumber: 'desc' },
    include: {
      exports: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return {
    course,
    versions
  };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const session = await locals.auth.getSession({ headers: request.headers });
    if (!session?.user) throw redirect(302, '/auth/signin');

    const formData = await request.formData();
    const versionId = formData.get('versionId') as string;

    if (!versionId) return fail(400, { message: 'Version ID required' });

    try {
      const exportId = await ExportJob.start(versionId);
      return { success: true, exportId };
    } catch (error) {
      console.error(error);
      return fail(500, { message: 'Failed to start export' });
    }
  }
};
