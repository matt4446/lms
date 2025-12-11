<script lang="ts">
    import { page } from '$app/stores';
    import { authClient } from '$lib/auth-client';
    import { goto } from '$app/navigation';

    let { session, siteName = 'DrillSkill' } = $props();
    let isProfileOpen = $state(false);

    async function logout() {
        await authClient.signOut();
        window.location.href = '/';
    }

    function toggleProfile() {
        isProfileOpen = !isProfileOpen;
    }

    // Close dropdown when clicking outside (simple implementation)
    function handleOutsideClick(event: MouseEvent) {
        if (isProfileOpen && !(event.target as Element).closest('.profile-menu')) {
            isProfileOpen = false;
        }
    }
</script>

<svelte:window onclick={handleOutsideClick} />

<nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <div class="flex-shrink-0 flex items-center">
                    <a href="/" class="text-xl font-bold text-indigo-600">{siteName}</a>
                </div>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a href="/courses" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        Courses
                    </a>
                    {#if session}
                    <a href="/dashboard" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        Dashboard
                    </a>
                    {/if}
                </div>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:items-center">
                {#if session}
                    <div class="ml-3 relative profile-menu">
                        <div>
                            <button 
                                type="button" 
                                class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 items-center" 
                                id="user-menu-button" 
                                aria-expanded={isProfileOpen} 
                                aria-haspopup="true"
                                onclick={toggleProfile}
                            >
                                <span class="sr-only">Open user menu</span>
                                <span class="mr-2 text-sm text-gray-700 font-medium">{session.user.name}</span>
                                {#if session.user.image}
                                    <img class="h-8 w-8 rounded-full" src={session.user.image} alt="">
                                {:else}
                                    <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                                        {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                                    </div>
                                {/if}
                            </button>
                        </div>
                        
                        {#if isProfileOpen}
                            <div 
                                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50" 
                                role="menu" 
                                aria-orientation="vertical" 
                                aria-labelledby="user-menu-button" 
                                tabindex="-1"
                            >
                                <div class="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                                    <p class="truncate font-medium">{session.user.email}</p>
                                </div>
                                <a href="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1">Dashboard</a>
                                <a href="/courses/create" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1">Create Course</a>
                                <button onclick={logout} class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1">Sign out</button>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="ml-3 relative">
                        <div class="flex space-x-4">
                            <a href="/auth/login" class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Login</a>
                            <a href="/auth/register" class="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Register</a>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</nav>
