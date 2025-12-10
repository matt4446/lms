import { prisma } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, request }) => {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        throw redirect(302, `/auth/login?redirectTo=/courses/${params.id}/learn`);
    }

    const course = await prisma.course.findUnique({
        where: {
            id: params.id
        },
        include: {
            sections: {
                orderBy: {
                    order: 'asc'
                },
                select: {
                    id: true,
                    title: true,
                    order: true
                }
            }
        }
    });

    if (!course) {
        throw error(404, 'Course not found');
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId: course.id
            }
        }
    });

    if (!enrollment) {
        // Redirect to course detail page to enroll
        throw redirect(303, `/courses/${course.id}`);
    }

    return {
        course,
        enrollment
    };
};
