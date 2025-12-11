<script lang="ts">
    import { enhance } from '$app/forms';
    import { authClient } from '$lib/auth-client';
    import type { PageData, ActionData } from './$types';

    export let form: ActionData;
    export let data: PageData;

    let loading = false;
    let googleLoading = false;

    async function handleGoogleSignIn() {
        const siteNameInput = document.getElementById('siteName') as HTMLInputElement;
        const siteName = siteNameInput?.value;

        googleLoading = true;
        // Save siteName to cookie for retrieval after callback if provided
        if (siteName) {
            document.cookie = `setup_site_name=${encodeURIComponent(siteName)}; path=/; max-age=3600`;
        }

        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: '/setup' // Return to setup to finalize
            });
        } catch (err) {
            console.error(err);
            googleLoading = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to DrillSkill
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
            Let's get your LMS set up in seconds.
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {#if form?.message}
                <div class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{form.message}</span>
                </div>
            {/if}

            {#if data.session}
                <div class="mb-6 text-center">
                    <p class="text-sm text-gray-600">
                        Logged in as <span class="font-medium text-gray-900">{data.session.user.email}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        Please complete the setup below.
                    </p>
                </div>
            {/if}

            <form class="space-y-6" method="POST" use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    loading = false;
                    update();
                };
            }}>
                <div>
                    <label for="siteName" class="block text-sm font-medium text-gray-700">
                        Site Name
                    </label>
                    <div class="mt-1">
                        <input id="siteName" name="siteName" type="text" required 
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g. My Awesome Academy"
                        />
                    </div>
                </div>

                {#if !data.session}
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                            <div class="w-full border-t border-gray-300"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="px-2 bg-white text-sm text-gray-500">
                                Admin Account
                            </span>
                        </div>
                    </div>

                    <div>
                        <button type="button" onclick={handleGoogleSignIn} disabled={loading || googleLoading}
                            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4">
                            {#if googleLoading}
                                Connecting...
                            {:else}
                                <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 59.559 L -6.804 59.559 C -4.534 57.469 -3.264 54.409 -3.264 51.509 Z"/>
                                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z"/>
                                        <path fill="#EA4335" d="M -14.754 43.769 C -12.984 43.769 -11.404 44.379 -10.154 45.579 L -6.734 42.159 C -8.804 40.229 -11.514 39.009 -14.754 39.009 C -19.444 39.009 -23.494 41.709 -25.464 45.639 L -21.484 48.729 C -20.534 45.879 -17.884 43.769 -14.754 43.769 Z"/>
                                    </g>
                                </svg>
                                Sign up with Google
                            {/if}
                        </button>

                        <div class="relative mb-4">
                            <div class="absolute inset-0 flex items-center" aria-hidden="true">
                                <div class="w-full border-t border-gray-300"></div>
                            </div>
                            <div class="relative flex justify-center">
                                <span class="px-2 bg-white text-sm text-gray-500">
                                    Or with email
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <div class="mt-1">
                            <input id="name" name="name" type="text" required 
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <div class="mt-1">
                            <input id="email" name="email" type="email" autocomplete="email" required 
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div class="mt-1">
                            <input id="password" name="password" type="password" autocomplete="new-password" required 
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <p class="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
                    </div>
                {/if}

                <div>
                    <button type="submit" disabled={loading}
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {#if loading}
                            Setting up...
                        {:else}
                            Complete Setup
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
