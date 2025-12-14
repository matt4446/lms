import { prisma } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, request }) => {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    const course = await prisma.course.findUnique({
        where: {
            id: params.courseId
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true
                }
            },
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

    let isAuthor = false;
    let isEnrolled = false;

    if (session) {
        isAuthor = course.owner.id === session.user.id;
        
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: params.courseId
                }
            }
        });
        
        isEnrolled = !!enrollment;
    }

    return {
        course,
        isAuthor,
        isEnrolled
    };
};

export const actions: Actions = {
    enroll: async ({ request, params }) => {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            throw redirect(302, `/auth/login?redirectTo=/courses/${params.courseId}`);
        }

        const courseId = params.courseId;
        const userId = session.user.id;

        try {
            // Check if already enrolled
            const existingEnrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId
                    }
                }
            });

            if (existingEnrollment) {
                return fail(400, { message: 'Already enrolled' });
            }

            // Create enrollment
            await prisma.enrollment.create({
                data: {
                    userId,
                    courseId,
                    status: 'active',
                    progress: {}
                }
            });
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to enroll' });
        }

        throw redirect(303, '/dashboard');
    }
};
