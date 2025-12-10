import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { env } from '$env/dynamic/private';

console.log("DATABASE_URL:", env.DATABASE_URL);

export async function handle({ event, resolve }) {
	return svelteKitHandler({ event, resolve, auth });
}
