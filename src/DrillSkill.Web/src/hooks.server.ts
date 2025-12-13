import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { isAppConfigured } from '$lib/server/state';

console.log("DATABASE_URL:", env.DATABASE_URL);
export async function handle({ event, resolve }) {
    // 1. Skip logic during build time
    if (building) {
        return resolve(event);
    }

    const { pathname } = event.url;

    // 2. Define Public/System Paths (Whitelist)
    const isPublicPath = 
        pathname.startsWith('/setup') || 
        pathname.startsWith('/api/auth') || 
        pathname.startsWith('/_app') || 
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt';

    // 3. Check Configuration Status
    const configured = await isAppConfigured();

    // 4. Redirect Logic
    if (!configured) {
        // If not configured and trying to access a protected page -> Go to Setup
        if (!isPublicPath) {
            throw redirect(303, '/setup');
        }
    } else {
        // If configured and trying to access Setup -> Go Home (prevent re-setup)
        if (pathname.startsWith('/setup')) {
            throw redirect(303, '/');
        }
    }

    // Explicitly set locals.auth
    event.locals.auth = auth.api;

	try {
		return await svelteKitHandler({ event, resolve, auth, building });
	} catch (err: any) {
		// Mask sensitive header values for logs
		const headers: Record<string,string> = {};
		for (const [k,v] of event.request.headers) {
			if (!v) continue;
			const key = k.toLowerCase();
			if (key.includes('authorization') || key.includes('cookie') || key.includes('set-cookie')) {
				headers[key] = '****';
			} else {
				headers[key] = v;
			}
		}

		console.error('better-auth error on request:', {
			url: event.url.href,
			method: event.request.method,
			headers,
			message: err?.message ?? String(err)
		});
		if (err?.stack) console.error(err.stack);

		// rethrow so SvelteKit handles error responses as usual
		throw err;
	}
}
