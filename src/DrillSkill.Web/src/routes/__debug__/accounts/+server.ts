import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import type { RequestHandler } from './$types';

// Dev-only endpoint to list accounts and linked users for debugging OAuth linking issues.
export const GET: RequestHandler = async ({ request }) => {
    const host = request.headers.get('host') || '';
    // Only allow local requests for safety
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        return json({ error: 'Not allowed' }, { status: 403 });
    }

    try {
        const accounts = await prisma.account.findMany({
            select: {
                id: true,
                userId: true,
                providerId: true,
                accountId: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Load associated user emails for context
        const userIds = Array.from(new Set(accounts.map(a => a.userId)));
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true, name: true }
        });

        return json({ accounts, users });
    } catch (e) {
        console.error('Debug accounts endpoint error', e);
        return json({ error: 'Failed to query accounts' }, { status: 500 });
    }
};
