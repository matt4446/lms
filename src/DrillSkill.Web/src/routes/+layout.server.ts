import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { prisma } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ request }) => {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    const config = await prisma.systemConfig.findUnique({
        where: { id: 'default' },
        select: { siteName: true }
    });

    return {
        session,
        siteName: config?.siteName ?? 'DrillSkill'
    };
};
