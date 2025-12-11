import { auth } from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import { invalidateConfigCache, isAppConfigured } from '$lib/server/state';
import { fail } from '@sveltejs/kit';

export interface SetupData {
    siteName: string;
    name: string;
    email: string;
    password: string;
}

export async function performSetup(data: SetupData) {
    // 1. Double-check if already configured
    if (await isAppConfigured()) {
        return { success: false, error: 'Setup already completed' };
    }

    // 2. Create the user using Better-Auth
    // We use the API to handle hashing and session creation
    let signUpResponse;
    try {
        signUpResponse = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
            asResponse: true
        });
    } catch (e: any) {
        console.error('Setup: Failed to create user', e);
        let errorMessage = 'Failed to create admin user.';
        
        if (e?.body?.message) {
            errorMessage = e.body.message;
        } else if (e?.message) {
            errorMessage = e.message;
        }

        if (errorMessage.includes('Unique constraint') || errorMessage.includes('already exists')) {
            errorMessage = 'A user with this email already exists.';
        }

        return { success: false, error: errorMessage };
    }

    // 3. Elevate user to Admin
    try {
        await prisma.user.update({
            where: { email: data.email },
            data: { role: 'admin' }
        });
    } catch (e) {
        console.error('Setup: Failed to elevate user', e);
        // Try to cleanup? Or just fail.
        return { success: false, error: 'User created but failed to assign admin role.' };
    }

    // 4. Save System Configuration
    try {
        await prisma.systemConfig.upsert({
            where: { id: 'default' },
            update: {
                siteName: data.siteName,
                isSetup: true
            },
            create: {
                id: 'default',
                siteName: data.siteName,
                isSetup: true
            }
        });
        
        // Invalidate cache so hooks pick up the change
        invalidateConfigCache();

    } catch (e) {
        console.error('Setup: Failed to save config', e);
        return { success: false, error: 'Failed to save system configuration.' };
    }

    return { success: true, response: signUpResponse };
}

export async function finishSetup(userId: string, siteName: string) {
    // 1. Double-check if already configured
    if (await isAppConfigured()) {
        return { success: false, error: 'Setup already completed' };
    }

    // 2. Elevate user to Admin
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'admin' }
        });
    } catch (e) {
        console.error('Setup: Failed to elevate user', e);
        return { success: false, error: 'Failed to assign admin role.' };
    }

    // 3. Save System Configuration
    try {
        await prisma.systemConfig.upsert({
            where: { id: 'default' },
            update: {
                siteName: siteName,
                isSetup: true
            },
            create: {
                id: 'default',
                siteName: siteName,
                isSetup: true
            }
        });
        
        // Invalidate cache so hooks pick up the change
        invalidateConfigCache();

    } catch (e) {
        console.error('Setup: Failed to save config', e);
        return { success: false, error: 'Failed to save system configuration.' };
    }

    return { success: true };
}
