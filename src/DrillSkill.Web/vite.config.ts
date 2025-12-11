import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { resolve } from 'path';

export default defineConfig({
	plugins: [mkcert(), tailwindcss(), sveltekit()],
	server: {
		host: true,
		port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
		// @ts-ignore - allowedHosts is valid in newer Vite versions
		allowedHosts: true,
		https: true
	}
});
