import { prisma } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, request }) => {
    const section = await prisma.section.findUnique({
        where: {
            id: params.sectionId
        },
        include: {
            exam: {
                select: {
                    id: true
                }
            }
        }
    });

    if (!section) {
        throw error(404, 'Section not found');
    }

    if (section.courseId !== params.id) {
        throw error(404, 'Section not found in this course');
    }

    // Check prerequisites
    const session = await auth.api.getSession({
        headers: request.headers
    });
    
    if (!session) {
        throw redirect(302, `/auth/login?redirectTo=/courses/${params.id}/learn/${params.sectionId}`);
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId: params.id
            }
        }
    });

    if (!enrollment) {
        throw redirect(303, `/courses/${params.id}`);
    }

    const sections = await prisma.section.findMany({
        where: { courseId: params.id },
        orderBy: { order: 'asc' },
        select: { id: true }
    });

    const currentIndex = sections.findIndex(s => s.id === params.sectionId);
    if (currentIndex > 0) {
        const prevSection = sections[currentIndex - 1];
        const progress = (enrollment.progress as any) || {};
        if (!progress[prevSection.id]?.completed) {
            throw redirect(302, `/courses/${params.id}/learn/${prevSection.id}`);
        }
    }

    return {
        section,
        enrollment
    };
};

export const actions: Actions = {
    complete: async ({ request, params }) => {
        const session = await auth.api.getSession({
            headers: request.headers
        });
        
        if (!session) {
            throw redirect(302, '/auth/login');
        }

        // Check if section has an exam
        const section = await prisma.section.findUnique({
            where: { id: params.sectionId },
            include: { exam: true }
        });

        if (!section) {
            throw error(404, 'Section not found');
        }

        if (section.exam) {
            return fail(400, { message: 'Cannot manually complete a section with an exam' });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: params.id
                }
            }
        });

        if (!enrollment) {
            throw error(400, 'Not enrolled');
        }

        const progress = (enrollment.progress as any) || {};
        progress[params.sectionId] = { 
            completed: true, 
            completedAt: new Date().toISOString() 
        };

        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { progress }
        });
        
        return { success: true };
    }
};
