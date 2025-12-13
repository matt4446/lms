<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let activeMenuId = $state<string | null>(null);

    function toggleMenu(id: string, event: MouseEvent) {
        event.stopPropagation();
        if (activeMenuId === id) {
            activeMenuId = null;
        } else {
            activeMenuId = id;
        }
    }

    function closeMenu() {
        activeMenuId = null;
    }
</script>

<svelte:window onclick={closeMenu} />

{#snippet courseCard(course: any)}
    <div class="group relative border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
        {#if data.userId === course.owner.id}
            <div class="absolute top-4 right-4 z-20">
                <div class="relative inline-block text-left">
                    <button 
                        type="button" 
                        onclick={(e) => toggleMenu(course.id, e)}
                        class="relative inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        id="menu-button-{course.id}" 
                        aria-expanded={activeMenuId === course.id} 
                        aria-haspopup="true"
                    >
                        <span class="sr-only">Open options</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>

                    {#if activeMenuId === course.id}
                        <div 
                            class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" 
                            role="menu" 
                            aria-orientation="vertical" 
                            aria-labelledby="menu-button-{course.id}" 
                            tabindex="-1"
                            onclick={(e) => e.stopPropagation()}
                        >
                            <div class="py-1" role="none">
                                {#if !course.published && course.versions?.[0]}
                                    <form action="?/publish" method="POST" use:enhance>
                                        <input type="hidden" name="courseId" value={course.id} />
                                        <input type="hidden" name="versionId" value={course.versions[0].id} />
                                        <button type="submit" class="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">
                                            Publish
                                        </button>
                                    </form>
                                {/if}
                                
                                <a href="/courses/{course.id}/edit" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">
                                    Edit
                                </a>
                                
                                <a href="/courses/{course.id}/export" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">
                                    Export
                                </a>
                                
                                <form action="?/delete" method="POST" use:enhance>
                                    <input type="hidden" name="id" value={course.id} />
                                    <button 
                                        type="submit" 
                                        class="text-red-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" 
                                        role="menuitem" 
                                        tabindex="-1"
                                        onclick={() => confirm('Are you sure you want to delete this course? This action cannot be undone.')}
                                    >
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <div class="mt-4 flex justify-between">
            <div class="pr-12">
                <h3 class="text-lg font-medium text-gray-900">
                    <a href="/courses/{course.id}">
                        <span aria-hidden="true" class="absolute inset-0"></span>
                        {course.title}
                    </a>
                </h3>
                <p class="mt-1 text-sm text-gray-500 line-clamp-2">{course.description || 'No description available.'}</p>
            </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center">
                <span>{course._count.sections} Sections</span>
                <span class="mx-2">•</span>
                <span>{course.owner.name || 'Unknown'}</span>
            </div>
            {#if !course.published}
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Draft
                </span>
            {/if}
        </div>
    </div>
{/snippet}

<div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <div class="mb-12">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">My Courses</h2>
                <a href="/courses/create" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Create New Course
                </a>
            </div>
            {#if data.myCourses.length > 0}
                <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {#each data.myCourses as course}
                        {@render courseCard(course)}
                    {/each}
                </div>
            {:else}
                <p class="text-gray-500 text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                    You haven't created any courses yet.
                </p>
            {/if}
        </div>

        <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Course Catalog</h2>
            <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {#each data.catalogCourses as course}
                    {@render courseCard(course)}
                {/each}
                
                {#if data.catalogCourses.length === 0}
                    <p class="text-gray-500 col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                        No published courses available at the moment.
                    </p>
                {/if}
            </div>
        </div>
    </div>
</div>
