<script lang="ts">
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();
</script>

<div class="bg-white">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
                <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Welcome back, {data.user.name}
                </h2>
            </div>
        </div>

        <div class="mt-8">
            <h3 class="text-lg leading-6 font-medium text-gray-900">My Enrollments</h3>
            
            <div class="mt-4 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {#each data.enrollments as enrollment}
                    <div class="group relative border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div class="mt-4">
                            <h3 class="text-lg font-medium text-gray-900">
                                <a href="/courses/{enrollment.course.id}/learn">
                                    <span aria-hidden="true" class="absolute inset-0"></span>
                                    {enrollment.course.title}
                                </a>
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">{enrollment.course.description || 'No description available.'}</p>
                        </div>
                        <div class="mt-4">
                            <div class="relative pt-1">
                                <div class="flex mb-2 items-center justify-between">
                                    <div>
                                        <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                            {enrollment.status}
                                        </span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-xs font-semibold inline-block text-indigo-600">
                                            {enrollment.progress ? 'In Progress' : '0%'}
                                        </span>
                                    </div>
                                </div>
                                <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                                    <div style="width:0%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}

                {#if data.enrollments.length === 0}
                    <div class="col-span-full text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">No enrollments</h3>
                        <p class="mt-1 text-sm text-gray-500">Get started by enrolling in a course.</p>
                        <div class="mt-6">
                            <a href="/courses" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Browse Courses
                            </a>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
