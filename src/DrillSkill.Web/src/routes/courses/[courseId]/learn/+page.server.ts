import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
    const { course, enrollment } = await parent();

    if (!course.sections || course.sections.length === 0) {
        throw redirect(303, `/courses/${params.courseId}`);
    }

    const progress = (enrollment.progress as any) || {};
    
    // Find the first uncompleted section
    let targetSectionId = course.sections[0].id;
    let foundUncompleted = false;
    
    for (const section of course.sections) {
        if (!progress[section.id]?.completed) {
            targetSectionId = section.id;
            foundUncompleted = true;
            break;
        }
    }
    
    // If all sections are completed, redirect to course page
    if (!foundUncompleted) {
        throw redirect(303, `/courses/${params.courseId}`);
    }

    throw redirect(302, `/courses/${params.courseId}/learn/${targetSectionId}`);
};
