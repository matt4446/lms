import { prisma } from '$lib/server/db';

let isConfiguredCache: boolean | null = null;

export async function isAppConfigured(): Promise<boolean> {
    if (isConfiguredCache !== null) {
        return isConfiguredCache;
    }

    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: 'default' }
        });

        isConfiguredCache = config?.isSetup ?? false;
        return isConfiguredCache;
    } catch (error) {
        console.error('Failed to check app configuration:', error);
        return false;
    }
}

export function invalidateConfigCache() {
    isConfiguredCache = null;
}
