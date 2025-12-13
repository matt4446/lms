<script lang="ts">
    import { page } from '$app/stores';
    let { data, children } = $props();

    function getSectionStatus(sectionId: string, index: number) {
        const progress = (data.enrollment.progress as any) || {};
        const isCompleted = progress[sectionId]?.completed;
        
        if (isCompleted) return 'completed';
        
        if (index === 0) return 'available';
        
        const prevSectionId = data.course.sections[index - 1].id;
        const isPrevCompleted = progress[prevSectionId]?.completed;
        
        return isPrevCompleted ? 'available' : 'locked';
    }
</script>

<div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="hidden md:flex md:flex-shrink-0">
        <div class="flex flex-col w-64">
            <div class="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div class="flex items-center flex-shrink-0 px-4 mb-5">
                        <h1 class="text-lg font-bold text-gray-900 truncate" title={data.course.title}>
                            {data.course.title}
                        </h1>
                    </div>
                    <nav class="mt-5 flex-1 px-2 bg-white space-y-1">
                        {#each data.course.sections as section, i}
                            {@const isActive = $page.params.sectionId === section.id}
                            {@const status = getSectionStatus(section.id, i)}
                            
                            <a href={status === 'locked' ? undefined : `/courses/${data.course.id}/learn/${section.id}`}
                               class="{isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} {status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''} group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <span class="truncate flex-1">
                                    {section.title}
                                </span>
                                {#if status === 'completed'}
                                    <svg class="ml-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                {:else if status === 'locked'}
                                    <svg class="ml-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                                    </svg>
                                {/if}
                            </a>
                        {/each}
                    </nav>
                </div>
                <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <a href="/dashboard" class="flex-shrink-0 w-full group block">
                        <div class="flex items-center">
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    Back to Dashboard
                                </p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
        <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none h-full">
            <div class="py-6">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    {@render children()}
                </div>
            </div>
        </main>
    </div>
</div>
