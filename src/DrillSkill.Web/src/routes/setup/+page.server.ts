import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { performSetup, finishSetup } from '$lib/server/setup';
import { isAppConfigured } from '$lib/server/state';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ request }) => {
    if (await isAppConfigured()) {
        throw redirect(303, '/');
    }
    
    const session = await auth.api.getSession({
        headers: request.headers
    });

    return {
        session
    };
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const siteName = formData.get('siteName') as string;
        
        // Check if user is already logged in
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (session) {
            if (!siteName) {
                return fail(400, { message: 'Site Name is required' });
            }

            const result = await finishSetup(session.user.id, siteName);
            
            if (!result.success) {
                return fail(500, { message: result.error });
            }
            
            throw redirect(303, '/dashboard');
        }

        // Existing flow for unauthenticated users
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!siteName || !name || !email || !password) {
            return fail(400, { message: 'All fields are required' });
        }

        if (password.length < 8) {
            return fail(400, { message: 'Password must be at least 8 characters' });
        }

        const result = await performSetup({ siteName, name, email, password });

        if (!result.success) {
            return fail(500, { message: result.error });
        }

        // Forward the session cookie
        if (result.response) {
            const setCookieHeader = result.response.headers.get('set-cookie');
            if (setCookieHeader) {
                // Simple parsing for the main session cookie if possible, 
                // or just let the browser handle it if we were proxying.
                // Since we are in a form action, we need to set the cookie on the response.
                // SvelteKit cookies.set is the way.
                
                // Better-Auth usually sets 'better-auth.session_token'
                // We can try to parse all cookies set.
                const cookiesToSet = setCookieHeader.split(', '); // Split multiple cookies if any
                
                // This is a bit naive for complex headers, but Better-Auth usually sets one or two.
                // A better approach might be to rely on the client to login, but we want auto-login.
                
                // Let's try to parse the specific session token if we can, 
                // or just rely on the fact that we are redirecting.
                // Wait, we can't easily pass raw headers in SvelteKit actions unless we return a Response,
                // but actions return data or redirect.
                
                // Actually, we can use `cookies` object to set them.
                // We need to parse the `set-cookie` string.
                
                // Regex to capture key=value;
                const match = setCookieHeader.match(/([^=]+)=([^;]+);/);
                if (match) {
                    const [_, key, value] = match;
                    cookies.set(key, value, {
                        path: '/',
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 60 * 60 * 24 * 7 // 1 week, or parse from header
                    });
                }
            }
        }

        throw redirect(303, '/dashboard');
    }
};
