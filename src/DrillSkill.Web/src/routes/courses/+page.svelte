<script lang="ts">
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();
</script>

<div class="bg-white">
    <div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900">Course Catalog</h2>

        <div class="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {#each data.courses as course}
                <div class="group relative border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div class="mt-4 flex justify-between">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">
                                <a href="/courses/{course.id}">
                                    <span aria-hidden="true" class="absolute inset-0"></span>
                                    {course.title}
                                </a>
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">{course.description || 'No description available.'}</p>
                        </div>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500">
                        <span>{course._count.sections} Sections</span>
                        <span class="mx-2">•</span>
                        <span>Instructor: {course.owner.name || 'Unknown'}</span>
                    </div>
                </div>
            {/each}
            
            {#if data.courses.length === 0}
                <p class="text-gray-500 col-span-full text-center py-10">No courses available at the moment.</p>
            {/if}
        </div>
    </div>
</div>
