import { prisma } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { courseService } from '$lib/server/courses/service';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, request }) => {
    const session = await locals.auth.getSession({ headers: request.headers });
    
    const catalogCourses = await prisma.course.findMany({
        where: {
            published: true
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true
                }
            },
            _count: {
                select: {
                    sections: true
                }
            }
        }
    });

    let myCourses: any[] = [];

    if (session?.user) {
        myCourses = await prisma.course.findMany({
            where: {
                ownerId: session.user.id
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        sections: true
                    }
                },
                versions: {
                    where: { status: 'DRAFT' },
                    orderBy: { versionNumber: 'desc' },
                    take: 1,
                    select: { id: true }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
    }

    return {
        catalogCourses,
        myCourses,
        userId: session?.user?.id
    };
};

export const actions: Actions = {
    publish: async ({ request, locals }) => {
        const session = await locals.auth.getSession({ headers: request.headers });
        if (!session) return fail(401);
        
        const data = await request.formData();
        const courseId = data.get('courseId') as string;
        const versionId = data.get('versionId') as string;

        if (!courseId || !versionId) return fail(400, { message: 'Missing ID' });

        try {
            // Verify ownership
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { ownerId: true }
            });

            if (!course || course.ownerId !== session.user.id) {
                return fail(403, { message: 'Unauthorized' });
            }

            await courseService.publishVersion(courseId, versionId);
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to publish' });
        }
    },
    delete: async ({ request, locals }) => {
        const session = await locals.auth.getSession({ headers: request.headers });
        if (!session) return fail(401);
        
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) return fail(400, { message: 'Missing ID' });

        try {
            // Verify ownership
            const course = await prisma.course.findUnique({
                where: { id },
                select: { ownerId: true }
            });

            if (!course || course.ownerId !== session.user.id) {
                return fail(403, { message: 'Unauthorized' });
            }

            await courseService.deleteCourse(id);
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to delete' });
        }
    }
};
