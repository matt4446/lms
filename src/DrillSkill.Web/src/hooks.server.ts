import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

console.log("DATABASE_URL:", env.DATABASE_URL);
export async function handle({ event, resolve }) {
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
