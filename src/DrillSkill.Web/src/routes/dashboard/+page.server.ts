import { prisma } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        throw redirect(302, '/auth/login');
    }

    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            course: {
                include: {
                    owner: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            sections: true
                        }
                    }
                }
            }
        }
    });

    return {
        user: session.user,
        enrollments
    };
};
