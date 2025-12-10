import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, request }) => {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        throw redirect(302, '/auth/login');
    }

    const courseId = params.id;

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            sections: {
                include: {
                    exam: true
                }
            }
        }
    });

    if (!course) {
        throw error(404, 'Course not found');
    }

    if (course.ownerId !== session.user.id) {
        throw error(403, 'You are not authorized to view results for this course');
    }

    // Fetch all results for this course
    // We find results where the exam belongs to a section of this course
    const results = await prisma.result.findMany({
        where: {
            exam: {
                section: {
                    courseId: courseId
                }
            }
        },
        include: {
            enrollment: {
                include: {
                    user: true
                }
            },
            exam: {
                include: {
                    section: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return {
        course,
        results
    };
};
