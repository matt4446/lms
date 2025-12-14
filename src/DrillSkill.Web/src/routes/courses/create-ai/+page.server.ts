import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        throw redirect(302, '/auth/login');
    }

    return {};
};

export const actions: Actions = {
    save: async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const courseDataJson = formData.get('courseData') as string;

        if (!courseDataJson) {
            return fail(400, { error: 'Missing course data' });
        }

        let courseData;
        try {
            courseData = JSON.parse(courseDataJson);
        } catch (e) {
            return fail(400, { error: 'Invalid course data' });
        }

        // Override with form values if they were edited (optional, but good for UX)
        // For simplicity, we'll trust the JSON blob which should be updated by binding if we used bind:value
        // But in the Svelte file I didn't bind the inputs back to the generatedCourse object.
        // So I should actually parse the form fields or update the Svelte file to bind.
        
        // Let's update the Svelte file to bind the inputs to generatedCourse first to ensure edits are captured.
        // Actually, let's just parse the form data here to be safe and support non-JS if ever needed (though the AI part needs JS).
        // But wait, the dynamic sections inputs have names like `sections[0][title]`.
        // Parsing that manually is annoying.
        
        // BETTER APPROACH: Update the Svelte file to bind the inputs to `generatedCourse` properties.
        // Then the hidden input `courseData` will contain the updated values when submitted.
        
        // However, since I already wrote the Svelte file without bindings (just `value={...}`), the edits won't be reflected in `courseData` hidden input.
        // I will update the Svelte file first to use `bind:value`.
        
        // For now, let's assume I'll fix the Svelte file.
        
        try {
            const course = await prisma.$transaction(async (tx) => {
                const newCourse = await tx.course.create({
                    data: {
                        title: courseData.title,
                        description: courseData.description,
                        ownerId: session.user.id,
                        published: true,
                        sections: {
                            create: courseData.sections.map((section: any, index: number) => ({
                                title: section.title,
                                content: section.content,
                                order: index,
                                exam: section.exam ? {
                                    create: {
                                        questions: section.exam.questions
                                    }
                                } : undefined
                            }))
                        },
                        versions: {
                            create: {
                                versionNumber: 1,
                                title: courseData.title,
                                description: courseData.description,
                                status: 'PUBLISHED',
                                startDate: new Date()
                            }
                        }
                    },
                    include: {
                        versions: true
                    }
                });

                // Set published version
                if (newCourse.versions.length > 0) {
                    await tx.course.update({
                        where: { id: newCourse.id },
                        data: { publishedVersionId: newCourse.versions[0].id }
                    });
                }

                return newCourse;
            });

            return { success: true, courseId: course.id };
        } catch (e) {
            console.error(e);
            return fail(500, { error: 'Failed to save course' });
        }
    }
};
