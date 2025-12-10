import { prisma } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, request }) => {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        throw redirect(302, `/auth/login?redirectTo=/courses/${params.id}/learn/${params.sectionId}/exam`);
    }

    const exam = await prisma.exam.findUnique({
        where: {
            sectionId: params.sectionId
        },
        include: {
            section: {
                select: {
                    title: true,
                    courseId: true
                }
            }
        }
    });

    if (!exam) {
        throw error(404, 'Exam not found');
    }

    if (exam.section.courseId !== params.id) {
        throw error(404, 'Exam not found in this course');
    }

    // Strip correct answers
    const questions = (exam.questions as any[]).map(q => ({
        id: q.id,
        text: q.text,
        options: q.options
    }));

    return {
        exam: {
            ...exam,
            questions
        }
    };
};

export const actions: Actions = {
    submit: async ({ request, params }) => {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            throw redirect(302, '/auth/login');
        }

        const formData = await request.formData();
        const answers: Record<string, string> = {};
        
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('question-')) {
                const questionId = key.replace('question-', '');
                answers[questionId] = value.toString();
            }
        }

        const exam = await prisma.exam.findUnique({
            where: {
                sectionId: params.sectionId
            }
        });

        if (!exam) {
            return fail(404, { error: 'Exam not found' });
        }

        const questions = exam.questions as any[];
        let correctCount = 0;

        questions.forEach(q => {
            if (answers[q.id] === q.correctOptionId) {
                correctCount++;
            }
        });

        const score = (correctCount / questions.length) * 100;
        const passed = score >= 70; // 70% passing score

        // Save result
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: params.id
                }
            }
        });

        if (!enrollment) {
            return fail(400, { error: 'Not enrolled' });
        }

        await prisma.result.create({
            data: {
                examId: exam.id,
                enrollmentId: enrollment.id,
                score,
                passed,
                answers
            }
        });

        if (passed) {
            // Mark section as complete
            const progress = (enrollment.progress as any) || {};
            progress[params.sectionId] = { 
                completed: true, 
                completedAt: new Date().toISOString(),
                score
            };

            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { progress }
            });
        }

        return {
            success: true,
            score,
            passed,
            totalQuestions: questions.length,
            correctCount
        };
    }
};
