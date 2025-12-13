import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
    await parent(); // Ensure auth and course existence from layout

    const sections = await prisma.section.findMany({
        where: { courseId: params.id },
        orderBy: { order: 'asc' },
        include: {
            exam: true
        }
    });

    return {
        sections
    };
};

export const actions: Actions = {
    save: async ({ request, params, locals }) => {
        const session = await locals.auth.getSession({ headers: request.headers });
        if (!session) return fail(401);

        const formData = await request.formData();
        const sectionsJson = formData.get('sections') as string;

        if (!sectionsJson) {
            return fail(400, { message: 'Missing sections data' });
        }

        let sectionsData;
        try {
            sectionsData = JSON.parse(sectionsJson);
        } catch (e) {
            return fail(400, { message: 'Invalid sections data' });
        }

        try {
            // Transaction to update all sections
            await prisma.$transaction(async (tx) => {
                // 1. Get existing section IDs
                const existingSections = await tx.section.findMany({
                    where: { courseId: params.id },
                    select: { id: true }
                });
                const existingIds = new Set(existingSections.map(s => s.id));

                // 2. Process incoming sections
                for (let i = 0; i < sectionsData.length; i++) {
                    const section = sectionsData[i];
                    
                    if (section.id && existingIds.has(section.id)) {
                        // Update existing
                        await tx.section.update({
                            where: { id: section.id },
                            data: {
                                title: section.title,
                                content: section.content,
                                order: i,
                            }
                        });
                        
                        // Handle Exam
                        if (section.exam) {
                            await tx.exam.upsert({
                                where: { sectionId: section.id },
                                create: {
                                    sectionId: section.id,
                                    questions: section.exam.questions
                                },
                                update: {
                                    questions: section.exam.questions
                                }
                            });
                        } else {
                            // If exam was removed
                            await tx.exam.deleteMany({
                                where: { sectionId: section.id }
                            });
                        }
                        
                        existingIds.delete(section.id);
                    } else {
                        // Create new
                        await tx.section.create({
                            data: {
                                courseId: params.id,
                                title: section.title,
                                content: section.content,
                                order: i,
                                exam: section.exam ? {
                                    create: {
                                        questions: section.exam.questions
                                    }
                                } : undefined
                            }
                        });
                    }
                }

                // 3. Delete removed sections
                if (existingIds.size > 0) {
                    await tx.section.deleteMany({
                        where: {
                            id: { in: Array.from(existingIds) }
                        }
                    });
                }
            });

            return { success: true };
        } catch (e) {
            console.error('Error saving content:', e);
            return fail(500, { message: 'Failed to save content' });
        }
    }
};
