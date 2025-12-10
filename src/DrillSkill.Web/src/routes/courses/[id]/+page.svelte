<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';

    let { data } = $props<{ data: PageData }>();
    let enrolling = $state(false);
</script>

<div class="bg-white">
    <div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div class="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            <!-- Course Info -->
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{data.course.title}</h1>
                <div class="mt-4">
                    <p class="text-lg text-gray-500">{data.course.description || 'No description available.'}</p>
                </div>
                
                <div class="mt-6 border-t border-gray-200 pt-6">
                    <h3 class="text-sm font-medium text-gray-900">Instructor</h3>
                    <p class="mt-2 text-sm text-gray-500">{data.course.owner.name || 'Unknown'}</p>
                </div>

                <div class="mt-10">
                    <form method="POST" action="?/enroll" use:enhance={() => {
                        enrolling = true;
                        return async ({ update }) => {
                            await update();
                            enrolling = false;
                        };
                    }}>
                        <button type="submit" disabled={enrolling} class="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                        </button>
                    </form>
                </div>
            </div>

            <!-- Course Content Preview -->
            <div class="mt-10 lg:mt-0 lg:col-start-2">
                <h3 class="text-lg font-medium text-gray-900">Course Content</h3>
                <div class="mt-4 border border-gray-200 rounded-md overflow-hidden">
                    <ul role="list" class="divide-y divide-gray-200">
                        {#each data.course.sections as section}
                            <li class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div class="flex items-center justify-between">
                                    <p class="text-sm font-medium text-indigo-600 truncate">
                                        {section.title}
                                    </p>
                                    <div class="ml-2 flex-shrink-0 flex">
                                        <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Section {section.order + 1}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        {/each}
                        {#if data.course.sections.length === 0}
                            <li class="px-4 py-4 sm:px-6 text-gray-500 text-sm text-center">
                                No sections available yet.
                            </li>
                        {/if}
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
