import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const courses = await prisma.course.findMany({
        where: {
            published: true
        },
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
    });

    return {
        courses
    };
};
